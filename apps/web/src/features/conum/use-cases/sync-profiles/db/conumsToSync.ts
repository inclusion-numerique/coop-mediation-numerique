import { prismaClient } from '@app/web/prismaClient'

export const conumsToSync = async (users: { id: string; email: string }[]) =>
  prismaClient.mediateur.findMany({
    where: {
      userId: { in: users.map((user) => user.id) },
      conseillerNumerique: null,
    },
    select: {
      id: true,
      user: true,
    },
  })
