import { prismaClient } from '@app/web/prismaClient'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
import { max } from 'date-fns'

export const getLastUserActivityDate = async ({
  userId,
}: {
  userId: string
}) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      created: true,
      lastLogin: true,
      mutations: {
        select: {
          id: true,
          timestamp: true,
          nom: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  })

  if (!user) {
    throw new Error('User not found, cannot compute last activity')
  }

  const created = user.created
  const lastLogin = user.lastLogin
  const lastMutation = user.mutations?.[0]?.timestamp ?? null

  const lastActivity = max(
    [created, lastLogin, lastMutation].filter(isDefinedAndNotNull),
  )

  return {
    lastActivity,
    created,
    lastLogin,
    lastMutation,
  }
}
