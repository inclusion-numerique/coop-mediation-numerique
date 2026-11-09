import type { Prisma } from '@app/web/generated/prisma/client'
import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import type { Lieu } from '../../../../domain/lieu'
import { LieuId } from '../../../../domain/lieu-id'
import type { MediateurId } from '../../../../domain/mediateur-id'
import { estPublie } from '../../../../domain/visibilite-cartographie'
import {
  ecrireAuRegistre,
  identiteDuLieu,
  lieuCorrele,
  lieuFromDomain,
  preparerCorrele,
  toutesLesColonnes,
} from '../../../../implementation'
import { type EchecDeCreation, MediateurRequis } from '../../domain/errors'

const rattacher = async (
  transaction: Prisma.TransactionClient,
  {
    mediateurId,
    structureId,
    debut,
    creationParId,
  }: {
    readonly mediateurId: MediateurId
    readonly structureId: string
    readonly debut: Date
    readonly creationParId: string | null
  },
) => {
  const dejaRattache = await transaction.mediateurEnActivite.findFirst({
    where: { mediateurId, structureId, suppression: null, fin: null },
    select: { id: true },
  })

  if (dejaRattache) return

  await transaction.mediateurEnActivite.create({
    data: { id: v4(), mediateurId, structureId, debut, creationParId },
  })
}

const colonnesDuFormulaire = (lieu: Lieu) =>
  estPublie(lieu.visibilite) ? toutesLesColonnes : identiteDuLieu

const creerLaFiche = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
  donnees: ReturnType<typeof lieuFromDomain>,
): Promise<{ readonly id: string }> => {
  const cree = await transaction.lieuInclusion.create({
    data: donnees,
    select: { id: true },
  })

  await ecrireAuRegistre(transaction, {
    lieu,
    colonnes: colonnesDuFormulaire(lieu),
    maintenant: lieu.tracabilite.creation.date,
  })

  return cree
}

export const creerLieuActivite = async ({
  lieu,
  mediateurId,
}: {
  lieu: Lieu
  mediateurId: MediateurId | null
}): Promise<Result<{ readonly id: LieuId }, EchecDeCreation>> => {
  if (mediateurId == null) return failure(MediateurRequis)

  const donnees = lieuFromDomain(lieu)

  const structureId = await prismaClient.$transaction(async (transaction) => {
    const correle = await lieuCorrele(transaction, donnees)
    const prepare =
      correle &&
      (await preparerCorrele(
        transaction,
        correle,
        lieu.tracabilite.creation.date,
      ))

    const { id } = prepare ?? (await creerLaFiche(transaction, lieu, donnees))

    await rattacher(transaction, {
      mediateurId,
      structureId: id,
      debut: lieu.tracabilite.creation.date,
      creationParId: lieu.tracabilite.creation.par,
    })

    return id
  })

  return success({ id: LieuId(structureId) })
}
