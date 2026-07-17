import { inscriptionEtatFromDomain } from '@app/web/features/inscription/db'
import type { UserId } from '@app/web/features/inscription/domain'
import type { CartoStructure } from '@app/web/features/lieux-activite/use-cases/ajouter/domain'
import { prismaClient } from '@app/web/prismaClient'
import { toStructureFromCartoStructure } from '@app/web/structure/toStructureFromCartoStructure'
import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import type { EnregistrerReconciliation, LieuActiviteInput } from '../../domain'

/**
 * Matérialise un nouveau lieu (SIRET ou saisie manuelle) depuis son nom et son
 * adresse géocodée — mêmes colonnes que le mapper canonique des informations
 * générales d'un lieu (`nom` + adresse BAN + coordonnées). Le reste des
 * informations sera renseigné plus tard dans la gestion des lieux d'activité.
 */
const lieuInclusionDepuisAdresse = (lieu: LieuActiviteInput) => ({
  id: v4(),
  nom: lieu.nom,
  adresse: lieu.adresse,
  commune: lieu.commune,
  codePostal: lieu.codePostal,
  codeInsee: lieu.codeInsee,
  latitude: lieu.latitude,
  longitude: lieu.longitude,
})

/**
 * Crée une activité pour un lieu à rattacher (4 branches, chacune construite en
 * ligne pour rester dans les types nested de Prisma) :
 * - sans carto, avec id interne : rattache le lieu existant ;
 * - sans carto, sans id : matérialise un nouveau lieu depuis nom + adresse géocodée ;
 * - avec carto déjà matérialisée localement : rattache la structure existante ;
 * - avec carto non matérialisée : crée le lieu depuis la structure carto.
 */
const creerActivite = async (
  transaction: Prisma.TransactionClient,
  userId: UserId,
  lieu: LieuActiviteInput,
  structuresCartoParId: ReadonlyMap<string, CartoStructure>,
) => {
  if (!lieu.structureCartographieNationaleId) {
    return transaction.mediateurEnActivite.create({
      data: {
        id: v4(),
        mediateur: { connect: { userId } },
        lieuInclusion: lieu.id
          ? { connect: { id: lieu.id } }
          : { create: lieuInclusionDepuisAdresse(lieu) },
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
