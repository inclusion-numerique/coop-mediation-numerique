import departements from '@app/web/data/collectivites-territoriales/departements.json'
import { LieuActiviteOption } from '@app/web/features/lieux-activite/getLieuxActiviteOptions'
import { toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { prismaClient } from '@app/web/prismaClient'

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10

type SearchDepartementsLieuActiviteOptions = {
  mediateurId?: string
  searchParams?: {
    recherche?: string
    page?: string
    lignes?: string
  }
  excludeCodeInsee?: string[]
}

export const searchDepartementsLieuxActivite = async (
  options: SearchDepartementsLieuActiviteOptions,
) => {
  const searchParams = options.searchParams ?? {}
  const { mediateurId } = options
  const excludeCodeInsee = options.excludeCodeInsee ?? []

  const page = toNumberOr(searchParams?.page)(DEFAULT_PAGE)
  const pageSize = toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE)

  const rechercheParts = toQueryParts(searchParams)
    .map((p) => p.trim())
    .filter((p) => p !== '')
  const hasSearch = rechercheParts.length > 0

  const searchConditions = hasSearch
    ? {
        OR: rechercheParts.flatMap((part) =>
          departements
            .filter(
              (d) =>
                d.nom.toLowerCase().includes(part.toLowerCase()) ||
                d.code.startsWith(part),
            )
            .flatMap((d) => [
              { structure: { codeInsee: { startsWith: d.code } } },
              { lieuCodeInsee: { startsWith: d.code } },
            ]),
        ),
      }
    : {}

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
      structure: { select: { codeInsee: true } },
      lieuCodeInsee: true,
    },
    distinct: ['structureId', 'lieuCodeInsee'],
    orderBy: [{ structure: { codeInsee: 'asc' } }, { lieuCodeInsee: 'asc' }],
  })

  const uniques = activites.reduce<Map<string, LieuActiviteOption>>(
    (map, a) => {
      const codeInsee = a.structure?.codeInsee ?? a.lieuCodeInsee
      if (!codeInsee) return map

      const deptKey = codeInsee.slice(0, 2)
      if (map.has(deptKey)) return map

      const departement = departements.find((d) => d.code === deptKey)

      map.set(deptKey, {
        value: deptKey,
        label: `${departement?.code} · ${departement?.nom}`,
      })
      return map
    },
    new Map(),
  )

  return [...uniques.values()].slice((page - 1) * pageSize, page * pageSize)
}
