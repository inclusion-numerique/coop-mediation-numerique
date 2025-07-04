import { getDataTableSortParams } from '@app/web/libs/data-table/getDefaultDataTableSortParams'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { orderItemsByIndexedValues } from '@app/web/utils/orderItemsByIndexedValues'
import {
  ActivitesDataTable,
  ActivitesDataTableSearchParams,
} from '../components/ActivitesDataTable'
import { ActivitesRawSqlConfiguration } from './ActivitesRawSqlConfiguration'
import {
  activiteAccompagnementsCountSelect,
  activitesBeneficiaireInnerJoin,
  crasLieuLabelSelect,
  crasTypeOrderSelect,
  getActiviteFiltersSqlFragment,
  getActivitesFiltersWhereConditions,
} from './activitesFiltersSqlWhereConditions'
import { activiteListSelect } from './activitesQueries'

type SearchActiviteOptions = {
  mediateurId?: string
  beneficiaireIds?: string[]
  searchParams?: ActivitesDataTableSearchParams
}

export const searchActivite = async (options: SearchActiviteOptions) => {
  const searchParams = options.searchParams ?? {}

  const { sortBy, sortDirection } = getDataTableSortParams(
    searchParams,
    ActivitesDataTable,
  )

  const page = toNumberOr(searchParams?.page)(DEFAULT_PAGE)
  const pageSize = toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE)

  const { take, skip } = takeAndSkipFromPage({
    page,
    pageSize,
  })

  const mediateurIdMatch = options?.mediateurId ?? '_any_'

  const orderByCondition =
    sortBy in ActivitesRawSqlConfiguration
      ? ActivitesRawSqlConfiguration[
          sortBy as keyof typeof ActivitesRawSqlConfiguration
        ].rawOrderBySql(sortDirection)
      : null

  const filterConditions = getActivitesFiltersWhereConditions(searchParams)

  const filterFragment = getActiviteFiltersSqlFragment(filterConditions)

  const activiteIdsSearch = await prismaClient.$queryRaw<{ id: string }[]>`
      SELECT act.id                          as id,
             act.date                        as date,
             act.type                        as type,
             ${activiteAccompagnementsCountSelect} as participant_count,
             ${crasTypeOrderSelect}                as type_order,
             ${crasLieuLabelSelect}                as lieu

      FROM activites act
               ${activitesBeneficiaireInnerJoin(options.beneficiaireIds)}
               LEFT JOIN structures str ON act.structure_id = str.id
               LEFT JOIN mediateurs med ON act.mediateur_id = med.id
               LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id

      WHERE (act.mediateur_id = ${mediateurIdMatch}::UUID OR ${mediateurIdMatch} = '_any_')
        AND act.suppression IS NULL
        AND ${filterFragment}
      ORDER BY ${orderByCondition},
               date DESC
      LIMIT ${take ?? 2_147_483_647} OFFSET ${skip ?? 0}
  `

  const searchResultIds = activiteIdsSearch.map(({ id }) => id)

  const activitesQueryResult = await prismaClient.activite.findMany({
    where: {
      id: {
        in: searchResultIds,
      },
    },
    select: activiteListSelect,
  })

  const orderedActivites = orderItemsByIndexedValues(
    activitesQueryResult,
    searchResultIds,
  )

  const countQueryResult = await prismaClient.$queryRaw<{ count: number }[]>`
      SELECT COUNT(act.id)::INT as count
      FROM activites act
          ${activitesBeneficiaireInnerJoin(options.beneficiaireIds)}
          LEFT JOIN structures str ON act.structure_id = str.id
          LEFT JOIN mediateurs med ON act.mediateur_id = med.id
          LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id
      WHERE (act.mediateur_id = ${mediateurIdMatch}::UUID OR ${mediateurIdMatch} = '_any_')
        AND act.suppression IS NULL
        AND ${filterFragment}
  `

  const matchesCount = countQueryResult.at(0)?.count ?? 0

  const totalPages = take ? Math.ceil(matchesCount / take) : 1

  return {
    activites: orderedActivites,
    matchesCount,
    moreResults: Math.max(matchesCount - (take ?? 0), 0),
    totalPages,
    page,
    pageSize,
  }
}

export type SearchActiviteResult = Awaited<ReturnType<typeof searchActivite>>

export type SearchActiviteResultRow = SearchActiviteResult['activites'][number]
