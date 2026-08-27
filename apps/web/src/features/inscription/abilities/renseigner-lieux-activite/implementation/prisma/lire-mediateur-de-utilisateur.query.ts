import { prismaClient } from '@app/web/prismaClient'
import { type MediateurFromUser, MediateurId } from '../../domain'

/**
 * Rend le profil médiateur de l'utilisateur, ou `null` s'il n'en a pas — un
 * compte peut exister sans être médiateur (rôle pas encore choisi, coordinateur
 * seul), et l'absence est alors une réponse, pas une erreur d'infrastructure.
 */
export const mediateurFromUser: MediateurFromUser = async (userId) => {
  const mediateur = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: { id: true },
  })

  return mediateur === null ? null : MediateurId(mediateur.id)
}
