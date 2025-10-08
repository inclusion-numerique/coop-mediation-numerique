import { getFirstAndLastRdvDate } from '@app/web/features/rdvsp/queries/getFirstAndLastRdvDate'
import { isEmptySearchParams } from '@app/web/libs/data-table/isEmptySearchParams'
import type { UserId, UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import type { ActivitesDataTableSearchParams } from './components/ActivitesDataTable'
import { groupActivitesAndRdvsByDate } from './components/groupActivitesAndRdvsByDate'
import { getFirstAndLastActiviteDate } from './db/getFirstAndLastActiviteDate'
import { getWidestActiviteDatesRange } from './db/getWidestActiviteDatesRange'
import {
  type SearchActiviteAndRdvsResult,
  searchActiviteAndRdvs,
} from './db/searchActiviteAndRdvs'

const emptySearchResult = {
  items: [],
  activitesMatchesCount: 0,
  rdvMatchesCount: 0,
  matchesCount: 0,
  accompagnementsMatchesCount: 0,
  moreResults: 0,
  totalPages: 1,
  page: 1,
  pageSize: 50,
} satisfies SearchActiviteAndRdvsResult

export const getActivitesListPageData = async ({
  mediateurId,
  searchParams,
  user,
  includeRdvs = true,
}: {
  mediateurId: string
  searchParams: ActivitesDataTableSearchParams
  user: UserId & UserRdvAccount & UserTimezone
  includeRdvs?: boolean
}) => {
  /**
   * We search activites and rdvs in two different sources (database and rdv api)
   * - if we filtered on rdvs only, we do not need to return activities
   * - if we filtered on activites only, we do not need to return rdvs
   */
  const shouldFetchRdvs =
    includeRdvs &&
    !!user.rdvAccount?.id &&
    ((searchParams.rdvs?.length ?? 0) > 0 || // we filtered on rdvs
      (searchParams.types?.length ?? 0) === 0) // or we did not filter on activites types

  const shouldFetchActivites =
    (searchParams.rdvs?.length ?? 0) === 0 || // we did not filter on rdvs
    (searchParams.types?.length ?? 0) > 0 // or we filtered on activites

  console.log('query start', {
    shouldFetchRdvs,
    shouldFetchActivites,
    mediateurId,
    rdvAccountId: user.rdvAccount?.id,
  })

  const [searchResult, activiteDates, rdvDates] = await Promise.all([
    searchActiviteAndRdvs({
      mediateurIds: [mediateurId],
      searchParams,
      rdvAccountIds: user.rdvAccount ? [user.rdvAccount.id] : [],
      shouldFetchRdvs,
      shouldFetchActivites,
    }),
    getFirstAndLastActiviteDate({ mediateurIds: [mediateurId] }),
    getFirstAndLastRdvDate({
      rdvAccountIds: user.rdvAccount ? [user.rdvAccount.id] : [],
    }),
  ])

  console.log('query end', {
    searchResult,
    activiteDates,
    rdvDates,
  })

  const widestDatesRange = getWidestActiviteDatesRange(activiteDates, rdvDates)

  const activitesByDate = groupActivitesAndRdvsByDate({
    items: searchResult.items,
  })

  return {
    isFiltered: !isEmptySearchParams(searchParams),
    searchResult,
    searchParams,
    mediateurId,
    activiteDates: widestDatesRange,
    activitesByDate,
    user,
  }
}

export type ActivitesListPageData = Exclude<
  Awaited<ReturnType<typeof getActivitesListPageData>>,
  null
>
