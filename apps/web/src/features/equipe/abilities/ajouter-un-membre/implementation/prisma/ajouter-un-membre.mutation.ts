import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { lireLesAdhesionsDeLaPaire } from '../../../../db/adhesion.query'
import {
  adherer,
  type CoordinateurId,
  CoordinateurIntrouvable,
  type DejaMembre,
  MediateurId,
  type UtilisateurId,
} from '../../../../domain'
import { UtilisateurIntrouvable, UtilisateurNonMediateur } from '../../domain'

export type EchecDAjout =
  | UtilisateurIntrouvable
  | UtilisateurNonMediateur
  | CoordinateurIntrouvable
  | DejaMembre

export const ajouterUnMembre = async ({
  utilisateurId,
  coordinateurId,
  auteurId,
}: {
  utilisateurId: UtilisateurId
  coordinateurId: CoordinateurId
  auteurId: UtilisateurId
}): Promise<Result<void, EchecDAjout>> => {
  const [utilisateur, coordinateur] = await Promise.all([
    prismaClient.user.findUnique({
      where: { id: utilisateurId },
      select: { email: true, mediateur: { select: { id: true } } },
    }),
    prismaClient.coordinateur.findUnique({
      where: { id: coordinateurId },
      select: { id: true },
    }),
  ])

  if (utilisateur === null) return failure(UtilisateurIntrouvable())
  if (utilisateur.mediateur === null) return failure(UtilisateurNonMediateur())
  if (coordinateur === null) return failure(CoordinateurIntrouvable())

  const mediateurId = MediateurId(utilisateur.mediateur.id)

  const adhesion = adherer(
    { mediateurId, coordinateurId },
    await lireLesAdhesionsDeLaPaire({ mediateurId, coordinateurId }),
  )
  if (!adhesion.success) return adhesion

  await prismaClient.$transaction([
    prismaClient.mediateurCoordonne.create({
      data: { mediateurId, coordinateurId },
    }),
    prismaClient.invitationEquipe.deleteMany({
      where: {
        coordinateurId,
        acceptee: null,
        refusee: null,
        OR: [
          { mediateurId },
          { email: { equals: utilisateur.email, mode: 'insensitive' } },
        ],
      },
    }),
  ])

  addMutationLog({
    userId: auteurId,
    nom: 'CreerMediateurCoordonne',
    duration: 0,
    data: { mediateurId, coordinateurId },
  })

  return success(undefined)
}
