import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import {
  CoordinateurId,
  LienDePartageId,
  MediateurId,
  type ProprietairePartage,
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

const resolu = (
  proprietaire: ProprietairePartage,
  userId: string,
): PartageResolu => ({ proprietaire, utilisateurId: UtilisateurId(userId) })

const partageResolu = ({
  mediateur,
  coordinateur,
}: PartageLu): PartageResolu | null => {
  if (mediateur !== null)
    return resolu(
      { _tag: 'Mediateur', mediateurId: MediateurId(mediateur.id) },
      mediateur.userId,
    )
  if (coordinateur !== null)
    return resolu(
      { _tag: 'Coordinateur', coordinateurId: CoordinateurId(coordinateur.id) },
      coordinateur.userId,
    )
  return null
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
