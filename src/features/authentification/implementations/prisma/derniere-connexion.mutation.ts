import { prismaClient } from '@/configuration/prisma'

export const enregistrerLaDerniereConnexion = async ({
  userId,
}: {
  userId: string
}) => {
  await prismaClient.user.update({
    data: {
      lastLogin: new Date(),
    },
    where: {
      id: userId,
    },
  })
}
