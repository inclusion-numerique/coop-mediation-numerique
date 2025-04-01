import { prismaClient } from '@app/web/prismaClient'
import { MediateurUser } from '../auth/userTypeGuards'

export const setVisibility =
  ({ mediateur: { id } }: MediateurUser) =>
  async (isVisible: boolean) =>
    await prismaClient.mediateur.update({
      where: { id },
      data: { isVisible },
    })
