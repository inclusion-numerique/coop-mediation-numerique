import { prismaClient } from '@app/web/prismaClient'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Prisma } from '@prisma/client'

type SearchStructureOptions = {
  limit: number
}

export const searchStructure = async (
  query: string,
  options?: SearchStructureOptions,
) => {
  const structuresSearchLimit = options?.limit || 50
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
  } satisfies Prisma.StructureWhereInput

  const structuresRaw = await prismaClient.structure.findMany({
    where: matchesWhere,
    take: structuresSearchLimit,
    orderBy: {
      nom: 'asc',
    },
  })

  const matchesCount = await prismaClient.structure.count({
    where: matchesWhere,
  })

  const structures = structuresRaw.map(
    ({ nom, adresse, commune, ...rest }) => ({
      nom: toTitleCase(nom, { noUpper: true }),
      commune: toTitleCase(commune),
      adresse: toTitleCase(adresse, { noUpper: true }),
      ...rest,
    }),
  )

  return {
    structures,
    matchesCount,
    moreResults: Math.max(matchesCount - structuresSearchLimit, 0),
  }
}

export type SearchStructureResult = Awaited<ReturnType<typeof searchStructure>>

export type SearchStructureResultStructure =
  SearchStructureResult['structures'][number]
