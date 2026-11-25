import { prismaClient } from '@/configuration/prisma'

export const estConseillerNumeriqueEnPoste = async (
  userId: string,
): Promise<boolean | null> => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      personneMain: {
        select: {
          conseillerNumeriqueEnPoste: { select: { personneId: true } },
        },
      },
    },
  })

  return user === null
    ? null
    : user.personneMain?.conseillerNumeriqueEnPoste != null
}
