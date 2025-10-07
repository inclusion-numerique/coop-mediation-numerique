import { getHasCrasV1 } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getHasCrasV1'
import { isEmptySearchParams } from '@app/web/libs/data-table/isEmptySearchParams'
import { getRdvs } from '@app/web/rdv-service-public/getRdvs'
import {
  getEndOfDay,
  getOptionalEndOfDay,
  getOptionalStartOfDay,
} from '@app/web/utils/getDatePeriodBounds'
import type { UserId, UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import { addDays } from 'date-fns'
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
  activitesMatchesCount: 0,
  accompagnementsMatchesCount: 0,
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
          mediateurIds: [mediateurId],
          searchParams,
        })
      : emptySearchResult,
    getFirstAndLastActiviteDate({ mediateurIds: [mediateurId] }),
  ])

  // If the list is paginated, we only fetch rdvs until the last activites date
  const minRdvDate = searchResult.moreResults
    ? getOptionalStartOfDay(searchResult.activites.at(-1)?.date ?? null)
    : searchParams.du
      ? new Date(searchParams.du)
      : null

  // In the case of rdv only, we need to fetch activities that have a rdv_service_public_id to compute status/link between the two models
  const activitesForRdvs = shouldFetchActivites
    ? null
    : await searchActivite({
        mediateurIds: [mediateurId],
        searchParams,
        havingRdvId: true,
      })

  // If we are paginated and not on the first page, we only fetch rdvs until the first activite date
  // Rdv api truncate the date to the day, so we need to add 1 day to the date
  const maxRdvDateCurrentDay =
    searchResult.page > 1
      ? (searchResult.activites.at(0)?.date ?? null)
      : searchParams.au
        ? new Date(searchParams.au)
        : null

  // add one day to the date
  const maxRdvDate = maxRdvDateCurrentDay
    ? addDays(maxRdvDateCurrentDay, 1)
    : null

  const rdvs = await getRdvs({
    user,
    du: minRdvDate ?? undefined,
    au: maxRdvDate ?? undefined,
    onlyForUser: true,
    statuses: searchParams.rdvs,
  })

  const { rdvsWithoutActivite, activitesWithRdv } = mergeRdvsWithActivites({
    rdvs,
    activites: (shouldFetchActivites
      ? searchResult.activites
      : (activitesForRdvs?.activites ?? [])
    ).map(
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
