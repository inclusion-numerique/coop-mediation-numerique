import { prismaClient } from '@/configuration/prisma'

export const lireLesMediateursCoordonnes = async ({
  userId,
}: {
  userId: string
}) => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { userId },
    select: {
      id: true,
      mediateursCoordonnes: {
        where: { suppression: null },
        select: {
          id: true,
        },
      },
    },
  })

  return coordinateur?.mediateursCoordonnes
}
