import { prismaClient } from '@app/web/prismaClient'

export const getMediateursCoordonnesForInscription = async ({
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
