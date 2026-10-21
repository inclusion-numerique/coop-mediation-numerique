import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import {
  CoordinateurId,
  LienDePartageId,
  MediateurId,
  proprietairePartageDe,
  UtilisateurId,
} from '../../../../domain'
import { LienIntrouvable, type PartageResolu } from '../../domain'

const compteActif = { user: { deleted: null } }

const lirePartage = (id: LienDePartageId) =>
  prismaClient.partageStatistiques.findFirst({
    where: {
      id,
      deleted: null,
      OR: [{ mediateur: compteActif }, { coordinateur: compteActif }],
    },
    select: {
      mediateur: { select: { id: true, userId: true } },
      coordinateur: { select: { id: true, userId: true } },
    },
  })

type PartageLu = NonNullable<Awaited<ReturnType<typeof lirePartage>>>

const partageResolu = ({
  mediateur,
  coordinateur,
}: PartageLu): PartageResolu | null => {
  const proprietaire = proprietairePartageDe({
    mediateurId: mediateur === null ? null : MediateurId(mediateur.id),
    coordinateurId:
      coordinateur === null ? null : CoordinateurId(coordinateur.id),
  })
  const compte = mediateur ?? coordinateur

  return proprietaire === null || compte === null
    ? null
    : { proprietaire, utilisateurId: UtilisateurId(compte.userId) }
}

export const resoudreUnLienDePartage = async (
  lien: string,
): Promise<Result<PartageResolu, LienIntrouvable>> => {
  const id = LienDePartageId.safe(lien)
  if (id === null) return failure(LienIntrouvable())

  const partage = await lirePartage(id)
  const resolu = partage === null ? null : partageResolu(partage)

  return resolu === null ? failure(LienIntrouvable()) : success(resolu)
}
