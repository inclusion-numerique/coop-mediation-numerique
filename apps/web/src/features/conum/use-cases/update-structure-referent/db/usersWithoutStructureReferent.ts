import { prismaClient } from '@app/web/prismaClient'

export const usersWithoutStructureReferent = async () =>
  await prismaClient.user.findMany({
    where: {
      mediateur: { conseillerNumerique: { isNot: null } },
      emplois: {
        every: {
          structure: { nomReferent: null },
        },
      },
    },
    include: {
      mediateur: {
        include: { conseillerNumerique: true },
      },
      emplois: {
        include: { structure: true },
      },
    },
  })
