import { SessionUser } from '@app/web/auth/sessionUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { prismaClient } from '@app/web/prismaClient'

export const isTagOwner = (sessionUser: SessionUser) => (id: string) => {
  if (isMediateur(sessionUser)) {
    return prismaClient.tag
      .findFirst({
        where: {
          id,
          mediateurId: sessionUser.mediateur.id,
        },
      })
      .then((tag) => tag != null)
  }
  if (isCoordinateur(sessionUser)) {
    const departement = getUserDepartement(sessionUser)

    if (!departement) return false

    return prismaClient.tag
      .findFirst({
        where: {
          id,
          departement: departement.code,
        },
      })
      .then((tag) => tag != null)
  }
  return false
}
