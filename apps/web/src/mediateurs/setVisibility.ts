import { prismaClient } from '@app/web/prismaClient'
import { MediateurUser } from '../auth/userTypeGuards'

export const setVisibility =
  ({ mediateur: { id } }: MediateurUser) =>
  async (isVisible: boolean) => {
    const now = new Date()
    return prismaClient.mediateur.update({
      where: { id },
      data: {
        isVisible,
        modification: now,
        user: { update: { updated: now } },
      },
    })
  }
