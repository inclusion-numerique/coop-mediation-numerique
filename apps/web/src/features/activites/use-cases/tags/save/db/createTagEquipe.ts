import { SessionUser } from '@app/web/auth/sessionUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { prismaClient } from '@app/web/prismaClient'

export const canCreateTagForEquipe = (
  sessionUser: SessionUser,
  equipeId: string,
): boolean => {
  if (isCoordinateur(sessionUser) && sessionUser.coordinateur.id === equipeId) {
    return true
  }

  if (isMediateur(sessionUser)) {
    const belongsToEquipe = sessionUser.mediateur.coordinations.some(
      (coordination) => coordination.coordinateur.id === equipeId,
    )
    return belongsToEquipe
  }

  return false
}

export const createTagEquipe =
  (coordinateurId: string) =>
  async ({ nom, description }: { nom: string; description?: string | null }) =>
    prismaClient.tag.create({
      data: {
        nom,
        description,
        coordinateur: { connect: { id: coordinateurId } },
        equipe: true,
      },
    })
