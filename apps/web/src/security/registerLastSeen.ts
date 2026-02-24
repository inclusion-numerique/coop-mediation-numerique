import { prismaClient } from '@app/web/prismaClient'

const THROTTLE_MS = 60 * 60 * 1000 // 1 hour

export const registerLastSeen = ({
  userId,
  currentLastSeen,
}: {
  userId: string
  currentLastSeen: Date | null
}) => {
  if (currentLastSeen && Date.now() - currentLastSeen.getTime() < THROTTLE_MS) {
    return
  }

  prismaClient.user
    .update({
      data: {
        lastSeen: new Date(),
      },
      where: {
        id: userId,
      },
    })
    // biome-ignore lint/suspicious/noEmptyBlockStatements: fire-and-forget
    .catch(() => {})
}
