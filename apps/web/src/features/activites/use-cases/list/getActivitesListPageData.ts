import { isEmptySearchParams } from '@app/web/libs/data-table/isEmptySearchParams'
import { ActivitesDataTableSearchParams } from './components/ActivitesDataTable'
import { getFirstAndLastActiviteDate } from './db/getFirstAndLastActiviteDate'
import { searchActivite } from './db/searchActivite'

export const getActivitesListPageData = async ({
  mediateurId,
  searchParams,
}: {
  mediateurId: string
  searchParams: ActivitesDataTableSearchParams
}) => {
  const [searchResult, activiteDates] = await Promise.all([
    searchActivite({
      mediateurId,
      searchParams,
    }),
    getFirstAndLastActiviteDate({ mediateurIds: [mediateurId] }),
  ])

  return {
    isFiltered: !isEmptySearchParams(searchParams),
    searchResult,
    searchParams,
    mediateurId,
    activiteDates,
  }
}

export type ActivitesListPageData = Exclude<
  Awaited<ReturnType<typeof getActivitesListPageData>>,
  null
>
