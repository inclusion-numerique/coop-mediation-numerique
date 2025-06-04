import { getRdvs } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getRdvs'
import { isEmptySearchParams } from '@app/web/libs/data-table/isEmptySearchParams'
import { getOptionalStartOfDay } from '@app/web/utils/getDatePeriodBounds'
import type { UserId, UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import { ActivitesDataTableSearchParams } from './components/ActivitesDataTable'
import { groupActivitesAndRdvsByDate } from './db/activitesQueries'
import { getFirstAndLastActiviteDate } from './db/getFirstAndLastActiviteDate'
import { searchActivite } from './db/searchActivite'
import { mergeRdvsWithActivites } from './mergeRdvsWithActivites'

export const getActivitesListPageData = async ({
  mediateurId,
  searchParams,
  user,
}: {
  mediateurId: string
  searchParams: ActivitesDataTableSearchParams
  user: UserId & UserRdvAccount & UserTimezone
}) => {
  const [searchResult, activiteDates] = await Promise.all([
    searchActivite({
      mediateurId,
      searchParams,
    }),
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
  })

  const { rdvsWithoutActivite, activitesWithRdv } = mergeRdvsWithActivites({
    rdvs,
    activites: searchResult.activites,
  })

  const activitesByDate = groupActivitesAndRdvsByDate({
    activites: activitesWithRdv,
    rdvs: rdvsWithoutActivite,
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
