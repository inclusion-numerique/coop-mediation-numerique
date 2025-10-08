import { Spinner } from '@app/web/ui/Spinner'
import { Suspense } from 'react'
import ActivitesTable from './components/ActivitesTable'
import { getActivitesResultCountLabel } from './components/getActivitesResultCountLabel'
import type { ActivitesListPageData } from './getActivitesListPageData'
import type { SearchActiviteResultItem } from './db/searchActiviteAndRdvs'

const SuspensedContent = async ({
  data,
}: {
  data: Promise<ActivitesListPageData>
}) => {
  const { searchParams, searchResult, isFiltered, user } = await data

  return (
    <>
      <p className="fr-text--bold fr-text--lg fr-my-6v">
        {getActivitesResultCountLabel({
          isFiltered,
          searchResult,
          only: 'activite',
        })}
      </p>
      <ActivitesTable
        data={{
          ...searchResult,
          activites: searchResult.items.filter(
            (item): item is SearchActiviteResultItem =>
              item.kind === 'activite',
          ),
          timezone: user.timezone,
        }}
        baseHref="/coop/mes-activites/tableau"
        searchParams={searchParams}
      />
    </>
  )
}

const MesActivitesTableauPage = ({
  data,
}: {
  data: Promise<ActivitesListPageData>
}) => (
  <>
    <Suspense fallback={<Spinner />}>
      <SuspensedContent data={data} />
    </Suspense>
  </>
)

export default MesActivitesTableauPage
