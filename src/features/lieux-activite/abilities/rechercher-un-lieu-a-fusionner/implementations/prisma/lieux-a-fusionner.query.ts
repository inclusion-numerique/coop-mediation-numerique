import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'

const LIMITE = 50

export const lieuxAFusionner = async (query: string) => {
  const structuresSearchLimit = LIMITE
  const queryParts = query.split(' ')

  const matchesWhere = {
    suppression: null,
    AND: queryParts.map((part) => ({
      OR: [
        {
          siret: {
            contains: part,
            mode: 'insensitive',
          },
        },
        {
          nom: {
            contains: part,
            mode: 'insensitive',
          },
        },
        {
          adresse: {
            contains: part,
            mode: 'insensitive',
          },
        },
        {
          commune: {
            contains: part,
            mode: 'insensitive',
          },
        },
      ],
    })),
  } satisfies Prisma.LieuInclusionWhereInput

  const structuresRaw = await prismaClient.lieuInclusion.findMany({
    where: matchesWhere,
    take: structuresSearchLimit,
    orderBy: {
      nom: 'asc',
    },
  })

  const matchesCount = await prismaClient.lieuInclusion.count({
    where: matchesWhere,
  })

  return {
    structures: structuresRaw,
    matchesCount,
    moreResults: Math.max(matchesCount - structuresSearchLimit, 0),
  }
}
