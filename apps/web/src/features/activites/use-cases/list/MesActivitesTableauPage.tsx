import { Spinner } from '@app/web/ui/Spinner'
import { Suspense } from 'react'
import ActivitesTable from './components/ActivitesTable'
import { getActivitesResultCountLabel } from './components/getActivitesResultCountLabel'
import { ActivitesListPageData } from './getActivitesListPageData'

const SuspensedContent = async ({
  data,
}: {
  data: Promise<ActivitesListPageData>
}) => {
  const { searchParams, searchResult, isFiltered } = await data

  return (
    <>
      <p className="fr-text--bold fr-text--lg fr-mb-6v fr-mt-2v">
        {getActivitesResultCountLabel({ isFiltered, searchResult })}
      </p>
      <ActivitesTable
        data={searchResult}
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
