import { inscriptionEtatFromDomain } from '@app/web/features/inscription/db'
import type { UserId } from '@app/web/features/inscription/domain'
import type { CartoStructure } from '@app/web/features/lieux-activite/use-cases/ajouter/domain'
import { prismaClient } from '@app/web/prismaClient'
import { toStructureFromCartoStructure } from '@app/web/structure/toStructureFromCartoStructure'
import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import type {
  EnregistrerReconciliation,
  LieuActiviteDesire,
} from '../../domain'

/**
 * Crée une activité pour un lieu à rattacher (parité legacy, 3 branches, chacune
 * construite en ligne pour rester dans les types nested de Prisma) :
 * - sans carto : rattache le lieu par son id interne (id requis, sinon rejet) ;
 * - avec carto déjà matérialisée localement : rattache la structure existante ;
 * - avec carto non matérialisée : crée le lieu depuis la structure carto.
 */
const creerActivite = async (
  transaction: Prisma.TransactionClient,
  userId: UserId,
  lieu: LieuActiviteDesire,
  structuresCartoParId: ReadonlyMap<string, CartoStructure>,
) => {
  if (!lieu.structureCartographieNationaleId) {
    if (!lieu.id) throw new Error('Invalid structure for lieu activité')

    return transaction.mediateurEnActivite.create({
      data: {
        id: v4(),
        mediateur: { connect: { userId } },
        lieuInclusion: { connect: { id: lieu.id } },
        debut: new Date(),
      },
    })
  }

  const existante = await transaction.lieuInclusion.findFirst({
    where: {
      structureCartographieNationaleId: lieu.structureCartographieNationaleId,
    },
    select: { id: true },
  })

  if (existante) {
    return transaction.mediateurEnActivite.create({
      data: {
        id: v4(),
        mediateur: { connect: { userId } },
        lieuInclusion: { connect: { id: existante.id } },
        debut: new Date(),
      },
    })
  }

  const cartoStructure = structuresCartoParId.get(
    lieu.structureCartographieNationaleId,
  )

  if (!cartoStructure) throw new Error('Structure carto not found')

  return transaction.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId } },
      lieuInclusion: { create: toStructureFromCartoStructure(cartoStructure) },
      debut: new Date(),
    },
  })
}

/**
 * Applique la réconciliation en une transaction : clôt les activités retirées,
 * crée les nouvelles, puis projette l'état franchi (colonnes d'inscription issues
 * du transfer, jamais composées à la main). Les structures carto ont été résolues
 * hors transaction (Entrepôt, client Prisma distinct).
 */
export const enregistrerReconciliation: EnregistrerReconciliation = async ({
  etatFranchi,
  userId,
  aCloturer,
  aCreer,
  structuresCarto,
}) => {
  const structuresCartoParId = new Map(
    structuresCarto.map((structure) => [structure.id, structure]),
  )
  const now = new Date()

  await prismaClient.$transaction(async (transaction) => {
    await transaction.mediateurEnActivite.updateMany({
      where: { id: { in: [...aCloturer] } },
      data: { fin: now, suppression: now, suppressionParId: userId },
    })

    await Promise.all(
      aCreer.map((lieu) =>
        creerActivite(transaction, userId, lieu, structuresCartoParId),
      ),
    )

    await transaction.user.update({
      where: { id: userId },
      data: inscriptionEtatFromDomain(etatFranchi),
    })
  })
}
