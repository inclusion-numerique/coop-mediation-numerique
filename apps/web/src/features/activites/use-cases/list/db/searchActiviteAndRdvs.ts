import {
  getRdvsByIds,
  type RdvListItem,
} from '@app/web/features/rdvsp/administration/db/rdvQueries'
import { getDataTableSortParams } from '@app/web/libs/data-table/getDefaultDataTableSortParams'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { orderItemsByIndexedValues } from '@app/web/utils/orderItemsByIndexedValues'
import { Prisma } from '@prisma/client'
import {
  ActivitesDataTable,
  ActivitesDataTableSearchParams,
} from '../components/ActivitesDataTable'
import {
  activitesBeneficiaireInnerJoin,
  getActiviteFiltersSqlFragment,
  getActivitesFiltersWhereConditions,
  getRdvFiltersSqlFragment,
  getRdvFiltersWhereConditions,
} from './activitesFiltersSqlWhereConditions'
import { type ActiviteListItem, getActivitesByIds } from './activitesQueries'
import { rdvFiltersWhereClause } from './rdvFiltersSqlWhereConditions'

type SearchActiviteAndRdvsOptions = {
  mediateurIds: string[]
  beneficiaireIds?: string[] // empty array will return no activite, undefined will return all activites
  rdvUserIds?: number[] // empty array will return no rdv, undefined will return all rdvs
  searchParams?: ActivitesDataTableSearchParams
  havingRdvId?: boolean
  rdvAccountIds: number[]
  shouldFetchRdvs: boolean
  shouldFetchActivites: boolean
}

export type ActiviteOrRdvKind = 'activite' | 'rdv'

type CombinedItem = {
  kind: ActiviteOrRdvKind
  id: string
}

export const searchActiviteAndRdvs = async (
  options: SearchActiviteAndRdvsOptions,
) => {
  const searchParams = options.searchParams ?? {}

  const { sortDirection } = getDataTableSortParams(
    searchParams,
    ActivitesDataTable,
  )

  const page = toNumberOr(searchParams?.page)(DEFAULT_PAGE)
  const pageSize = toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE)

  const { take, skip } = takeAndSkipFromPage({
    page,
    pageSize,
  })

  const mediateurIds = options?.mediateurIds ?? []

  const activitesFilterConditions =
    getActivitesFiltersWhereConditions(searchParams)
  const activitesFilterFragment = getActiviteFiltersSqlFragment(
    activitesFilterConditions,
  )

  const rdvFilterConditions = getRdvFiltersWhereConditions(searchParams)
  const rdvFilterFragment = getRdvFiltersSqlFragment(rdvFilterConditions)

  const mediateurIdsCondition =
    mediateurIds.length > 0
      ? Prisma.sql`act.mediateur_id = ANY(${mediateurIds}::UUID[])`
      : Prisma.sql`TRUE`

  const rdvWhereClause = rdvFiltersWhereClause({
    rdvUserIds: options.rdvUserIds,
    rdvAccountIds: options.rdvAccountIds,
    shouldFetchRdvs: options.shouldFetchRdvs,
    includeRdvsWithAssociatedActivites: false,
  })

  // Combined query with UNION ALL for pagination across both tables
  const combinedItems = await prismaClient.$queryRaw<CombinedItem[]>`
    WITH filtered_activites AS (
      SELECT
        act.id AS id,
        act.date AS event_date,
        act.creation AS creation
      FROM activites act
           ${activitesBeneficiaireInnerJoin(options.beneficiaireIds)}
           LEFT JOIN structures str ON act.structure_id = str.id
           LEFT JOIN mediateurs med ON act.mediateur_id = med.id
           LEFT JOIN users u ON med.user_id = u.id
      WHERE ${mediateurIdsCondition}
        AND ${options.shouldFetchActivites ? Prisma.sql`TRUE` : Prisma.sql`FALSE`}
        AND act.suppression IS NULL
        AND (${activitesFilterFragment})
    ),
    filtered_rdvs AS (
      SELECT
        rdv.id AS id,
        rdv.starts_at AS event_date,
        rdv.created_at AS creation
      FROM rdvs rdv
        LEFT JOIN activites act ON act.rdv_id = rdv.id
      WHERE (${rdvWhereClause}) AND (${rdvFilterFragment})
    ),
    unioned AS (
      SELECT 'activite'::text AS kind, id::TEXT, event_date, creation FROM filtered_activites
      UNION ALL
      SELECT 'rdv'::text AS kind, id::TEXT, event_date, creation FROM filtered_rdvs
    )
    SELECT kind, id
    FROM unioned
    ORDER BY event_date ${Prisma.raw(sortDirection)}, creation ${Prisma.raw(sortDirection)}, id ${Prisma.raw(sortDirection)}
    LIMIT ${take} OFFSET ${skip}
  `
  // Separate activite and rdv IDs
  const activiteIds = combinedItems
    .filter((item) => item.kind === 'activite')
    .map((item) => item.id)
  const rdvIds = combinedItems
    .filter((item) => item.kind === 'rdv')
    .map((item) => Number(item.id))

  const orderedActivitesAndRdvIds = combinedItems.map((item) =>
    item.kind === 'activite' ? item.id : Number(item.id),
  )

  // Hydrate full objects in parallel
  const [activites, rdvs] = await Promise.all([
    activiteIds.length > 0
      ? getActivitesByIds({ ids: activiteIds }).then((activites) =>
          activites.map((activite) => ({
            kind: 'activite' as const,
            ...activite,
          })),
        )
      : Promise.resolve([]),
    rdvIds.length > 0
      ? getRdvsByIds({ ids: rdvIds }).then((rdvs) =>
          rdvs.map((rdv) => ({
            kind: 'rdv' as const,
            ...rdv,
          })),
        )
      : Promise.resolve([]),
  ])

  const orderedActivitesAndRdvs = orderItemsByIndexedValues(
    [...activites, ...rdvs],
    orderedActivitesAndRdvIds,
  )

  // Get counts
  const [activitesCountResult, rdvsCountResult] = await Promise.all([
    prismaClient.$queryRaw<{ count: number; accompagnements_count: number }[]>`
        WITH distinct_activites AS (
          SELECT DISTINCT ON (act.id)
            act.id,
            act.accompagnements_count
          FROM activites act
            ${activitesBeneficiaireInnerJoin(options.beneficiaireIds)}
            LEFT JOIN structures str ON act.structure_id = str.id
            LEFT JOIN mediateurs med ON act.mediateur_id = med.id
            LEFT JOIN users u ON med.user_id = u.id
          WHERE ${mediateurIdsCondition}
            AND ${options.shouldFetchActivites ? Prisma.sql`TRUE` : Prisma.sql`FALSE`}
            AND act.suppression IS NULL
            AND ${activitesFilterFragment}
        )
        SELECT 
          COUNT(id)::INT as count,
          SUM(accompagnements_count)::INT as accompagnements_count
        FROM distinct_activites
      `,
    prismaClient.$queryRaw<{ count: number }[]>`
        SELECT COUNT(rdv.id)::INT as count
        FROM rdvs rdv
          LEFT JOIN activites act ON act.rdv_id = rdv.id
        WHERE (${rdvWhereClause}) AND (${rdvFilterFragment})
      `,
  ])

  const activitesMatchesCount = activitesCountResult.at(0)?.count ?? 0
  const rdvMatchesCount = rdvsCountResult.at(0)?.count ?? 0
  const accompagnementsMatchesCount =
    activitesCountResult.at(0)?.accompagnements_count ?? 0

  const totalMatchesCount = activitesMatchesCount + rdvMatchesCount
  const totalPages = take ? Math.ceil(totalMatchesCount / take) : 1

  return {
    items: orderedActivitesAndRdvs,
    activitesMatchesCount,
    rdvMatchesCount,
    matchesCount: totalMatchesCount,
    accompagnementsMatchesCount,
    moreResults: Math.max(totalMatchesCount - (take ?? 0), 0),
    totalPages,
    page,
    pageSize,
  }
}

export type SearchActiviteAndRdvsResult = Awaited<
  ReturnType<typeof searchActiviteAndRdvs>
>

export type SearchRdvResultItem = RdvListItem & {
  kind: 'rdv'
}

export type SearchActiviteResultItem = ActiviteListItem & {
  kind: 'activite'
}

export type SearchActiviteAndRdvResultItem =
  | SearchRdvResultItem
  | SearchActiviteResultItem
