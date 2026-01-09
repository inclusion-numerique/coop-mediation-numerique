import { prismaClient } from '@app/web/prismaClient'

export const countTotalActifUsers = () =>
  prismaClient.user.count({
    where: {
      role: 'User',
      isFixture: false,
      deleted: null,
      inscriptionValidee: { not: null },
    },
  })
