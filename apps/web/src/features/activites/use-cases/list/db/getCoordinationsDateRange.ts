import { CoordinateurUser } from '@app/web/auth/userTypeGuards'
import { prismaClient } from '@app/web/prismaClient'

export const getCoordinationsDateRange = async ({
  user,
}: {
  user: CoordinateurUser
}) =>
  prismaClient.activiteCoordination.aggregate({
    _min: { date: true },
    _max: { date: true },
    where: {
      coordinateurId: user.coordinateur.id,
      suppression: null,
    },
  })
