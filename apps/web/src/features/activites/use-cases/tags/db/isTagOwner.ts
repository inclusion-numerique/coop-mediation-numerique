import { SessionUser } from '@app/web/auth/sessionUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { prismaClient } from '@app/web/prismaClient'

const toEquipeCoordinateurIds = (coordination: {
  coordinateur: { id: string }
}) => coordination.coordinateur.id

export const isTagOwner = (sessionUser: SessionUser) => (id: string) => {
  if (isCoordinateur(sessionUser)) {
    const departement = getUserDepartement(sessionUser)

    return prismaClient.tag
      .findFirst({
        where: {
          id,
          ...(departement == null
            ? { coordinateurId: sessionUser.coordinateur.id }
            : {
                OR: [
                  { departement: departement.code },
                  { coordinateurId: sessionUser.coordinateur.id },
                ],
              }),
        },
      })
      .then((tag) => tag != null)
  }

  if (isMediateur(sessionUser)) {
    const equipeCoordinateurIds = sessionUser.mediateur.coordinations.map(
      toEquipeCoordinateurIds,
    )

    return prismaClient.tag
      .findFirst({
        where: {
          id,
          OR: [
            { mediateurId: sessionUser.mediateur.id },
            ...(equipeCoordinateurIds.length > 0
              ? [
                  {
                    equipe: true,
                    coordinateurId: { in: equipeCoordinateurIds },
                  },
                ]
              : []),
          ],
        },
      })
      .then((tag) => tag != null)
  }
  return false
}
