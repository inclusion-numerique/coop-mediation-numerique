import { prismaClient } from '@app/web/prismaClient'

export type StructureEmployeuseOption = {
  id: string
  nom: string
  commune: string | null
}

export const getStructuresEmployeusesOptions = async ({
  mediateurIds,
}: {
  mediateurIds: string[]
}): Promise<StructureEmployeuseOption[]> => {
  if (mediateurIds.length === 0) return []

  const structures = await prismaClient.structureAdministrative.findMany({
    where: {
      emplois: {
        some: {
          user: {
            mediateur: {
              id: { in: mediateurIds },
            },
          },
          suppression: null,
        },
      },
    },
    select: {
      id: true,
      nom: true,
      commune: true,
    },
    orderBy: { nom: 'asc' },
  })

  return structures
}

export const searchStructuresEmployeuses = async ({
  query,
  mediateurIds,
  excludeIds = [],
}: {
  query: string
  mediateurIds: string[]
  excludeIds?: string[]
}): Promise<{ items: StructureEmployeuseOption[] }> => {
  if (mediateurIds.length === 0) return { items: [] }

  const searchTerms = query.toLowerCase().trim()

  const structures = await prismaClient.structureAdministrative.findMany({
    where: {
      AND: [
        {
          emplois: {
            some: {
              user: {
                mediateur: {
                  id: { in: mediateurIds },
                },
              },
              suppression: null,
            },
          },
        },
        {
          id: { notIn: excludeIds },
        },
        searchTerms
          ? {
              OR: [
                { nom: { contains: searchTerms, mode: 'insensitive' } },
                { commune: { contains: searchTerms, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    },
    select: {
      id: true,
      nom: true,
      commune: true,
    },
    orderBy: { nom: 'asc' },
    take: 20,
  })

  return { items: structures }
}
