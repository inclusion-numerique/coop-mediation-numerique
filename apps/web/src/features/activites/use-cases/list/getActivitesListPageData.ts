import { isEmptySearchParams } from '@app/web/libs/data-table/isEmptySearchParams'
import { getRdvs } from '@app/web/rdv-service-public/getRdvs'
import { getOptionalStartOfDay } from '@app/web/utils/getDatePeriodBounds'
import type { UserId, UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import type { ActivitesDataTableSearchParams } from './components/ActivitesDataTable'
import {
  type ActiviteListItem,
  groupActivitesAndRdvsByDate,
} from './db/activitesQueries'
import { getFirstAndLastActiviteDate } from './db/getFirstAndLastActiviteDate'
import { type SearchActiviteResult, searchActivite } from './db/searchActivite'
import { mergeRdvsWithActivites } from './mergeRdvsWithActivites'

const emptySearchResult = {
  activites: [],
  matchesCount: 0,
  moreResults: 0,
  totalPages: 1,
  page: 1,
  pageSize: 50,
} satisfies SearchActiviteResult

export const getActivitesListPageData = async ({
  mediateurId,
  searchParams,
  user,
}: {
  mediateurId: string
  searchParams: ActivitesDataTableSearchParams
  user: UserId & UserRdvAccount & UserTimezone
}) => {
  /**
   * We search activites and rdvs in two different sources (database and rdv api)
   * - if we filtered on rdvs only, we do not need to return activities
   * - if we filtered on activites only, we do not need to return rdvs
   */
  const shouldFetchRdvs =
    (searchParams.rdvs?.length ?? 0) > 0 || // we filtered on rdvs
    (searchParams.types?.length ?? 0) === 0 // or we did not filter on activites

  const shouldFetchActivites =
    (searchParams.rdvs?.length ?? 0) === 0 || // we did not filter on rdvs
    (searchParams.types?.length ?? 0) > 0 // or we filtered on activites

  const [searchResult, activiteDates] = await Promise.all([
    shouldFetchActivites
      ? searchActivite({
          mediateurId,
          searchParams,
        })
      : emptySearchResult,
    getFirstAndLastActiviteDate({ mediateurIds: [mediateurId] }),
  ])

  // If the list is paginated, we only fetch rdvs until the last activites date
  const maxRdvDate = getOptionalStartOfDay(
    searchResult.moreResults
      ? (searchResult.activites.at(-1)?.date ?? null)
      : null,
  )

  // If we are paginated and not on the first page, we only fetch rdvs until the first activite date
  const minRdvDate =
    searchResult.page > 1 ? (searchResult.activites.at(0)?.date ?? null) : null

  const rdvs = await getRdvs({
    user,
    du: minRdvDate ?? undefined,
    au: maxRdvDate ?? undefined,
    onlyForUser: true,
    statuses: searchParams.rdvs,
  })

  const { rdvsWithoutActivite, activitesWithRdv } = mergeRdvsWithActivites({
    rdvs,
    activites: searchResult.activites.map(
      (activite) =>
        ({
          ...activite,
          timezone: user.timezone,
        }) satisfies ActiviteListItem,
    ),
  })

  const activitesByDate = groupActivitesAndRdvsByDate({
    activites: shouldFetchActivites ? activitesWithRdv : [],
    rdvs: shouldFetchRdvs ? rdvsWithoutActivite : [],
  })

  return {
    isFiltered: !isEmptySearchParams(searchParams),
    searchResult,
    searchParams,
    mediateurId,
    activiteDates,
    activitesByDate,
    user,
    rdvsWithoutActivite,
  }
}

export type ActivitesListPageData = Exclude<
  Awaited<ReturnType<typeof getActivitesListPageData>>,
  null
>
