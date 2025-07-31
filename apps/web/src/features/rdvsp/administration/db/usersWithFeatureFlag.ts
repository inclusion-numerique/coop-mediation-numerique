import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import { prismaClient } from '@app/web/prismaClient'

export const usersWithFeatureFlag = async () =>
  await prismaClient.user.findMany({
    where: {
      featureFlags: { has: 'RdvServicePublic' },
    },
    select: sessionUserSelect,
    orderBy: {
      name: 'asc',
    },
  })
