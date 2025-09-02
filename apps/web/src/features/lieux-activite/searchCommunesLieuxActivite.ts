import { LieuActiviteOption } from '@app/web/features/lieux-activite/getLieuxActiviteOptions'
import { toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10

type SearchCommunesLieuActiviteOptions = {
  mediateurId?: string
  searchParams?: {
    recherche?: string
    page?: string
    lignes?: string
  }
  excludeCodeInsee?: string[]
}

export const searchCommunesLieuxActivite = async (
  options: SearchCommunesLieuActiviteOptions,
) => {
  const searchParams = options.searchParams ?? {}
  const { mediateurId } = options
  const excludeCodeInsee = options.excludeCodeInsee ?? []

  const page = toNumberOr(searchParams?.page)(DEFAULT_PAGE)
  const pageSize = toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE)

  const rechercheParts = toQueryParts(searchParams).filter(
    (p) => p.trim() !== '',
  )
  const hasSearch = rechercheParts.length > 0

  const searchConditions = hasSearch
    ? rechercheParts.map((part) => ({
        OR: [
          { structure: { commune: { contains: part, mode: 'insensitive' } } },
          {
            structure: { codePostal: { contains: part, mode: 'insensitive' } },
          },
          { lieuCommune: { contains: part, mode: 'insensitive' } },
          { lieuCodePostal: { contains: part, mode: 'insensitive' } },
        ],
      }))
    : []

  const where: any = {
    mediateurId,
    suppression: null,
    ...(hasSearch ? { AND: searchConditions } : {}),
    ...(excludeCodeInsee.length > 0
      ? {
          OR: [
            { structure: { codeInsee: { notIn: excludeCodeInsee } } },
            { lieuCodeInsee: { notIn: excludeCodeInsee } },
          ],
        }
      : {}),
  }

  const activites = await prismaClient.activite.findMany({
    where,
    select: {
      structure: {
        select: { codeInsee: true, commune: true, codePostal: true },
      },
      lieuCommune: true,
      lieuCodePostal: true,
      lieuCodeInsee: true,
    },
    distinct: ['structureId', 'lieuCodeInsee'], // déduplication SQL
    orderBy: [{ structure: { commune: 'asc' } }, { lieuCommune: 'asc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const uniques = activites.reduce<Map<string, LieuActiviteOption>>(
    (map, a) => {
      const key = a.structure?.codeInsee ?? a.lieuCodeInsee
      if (!key || map.has(key)) return map
      const label = a.structure
        ? `${a.structure.commune} · ${a.structure.codePostal}`
        : `${a.lieuCommune ?? ''} · ${a.lieuCodePostal ?? ''}`
      map.set(key, { value: key, label })
      return map
    },
    new Map(),
  )

  return [...uniques.values()]
}
