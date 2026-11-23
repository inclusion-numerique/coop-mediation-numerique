import { prismaClient } from '@/configuration/prisma/prismaClient'

export const registerLastLogin = async ({ userId }: { userId: string }) => {
  await prismaClient.user.update({
    data: {
      lastLogin: new Date(),
    },
    where: {
      id: userId,
    },
  })
}
