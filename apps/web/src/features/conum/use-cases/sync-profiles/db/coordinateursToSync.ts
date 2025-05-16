import { prismaClient } from '@app/web/prismaClient'

export const coordinateursToSync = async (
  users: { id: string; email: string }[],
) =>
  await prismaClient.coordinateur.findMany({
    where: {
      userId: { in: users.map((user) => user.id) },
      OR: [{ conseillerNumeriqueId: null }, { conseillerNumeriqueId: '' }],
    },
    select: {
      id: true,
      user: true,
    },
  })
