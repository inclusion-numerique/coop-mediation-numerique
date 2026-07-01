import { prismaClient } from '@app/web/prismaClient'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Prisma } from '@prisma/client'

type SearchStructureAdministrativeOptions = {
  limit: number
}

// Recherche d'identités légales employeuses (structure_administrative).
// Frère de `searchStructure`, qui cible le rôle lieu (cf. split 1a.2).
export const searchStructureAdministrative = async (
  query: string,
  options?: SearchStructureAdministrativeOptions,
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
  } satisfies Prisma.StructureAdministrativeWhereInput

  const structuresRaw = await prismaClient.structureAdministrative.findMany({
    where: matchesWhere,
    take: structuresSearchLimit,
    orderBy: {
      nom: 'asc',
    },
  })

  const matchesCount = await prismaClient.structureAdministrative.count({
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
