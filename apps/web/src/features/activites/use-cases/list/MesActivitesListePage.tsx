import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { Spinner } from '@app/web/ui/Spinner'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import { Fragment, Suspense } from 'react'
import ActiviteCard from './components/ActiviteCard'
import MesActivitesListeEmptyPage from './components/MesActivitesListeEmptyPage'
import RdvCard from './components/RdvCard'
import { getActivitesResultCountLabel } from './components/getActivitesResultCountLabel'
import { ActivitesListPageData } from './getActivitesListPageData'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

const SuspensedContent = async ({
  data,
}: {
  data: Promise<ActivitesListPageData>
}) => {
  const {
    searchParams,
    searchResult,
    isFiltered,
    activitesByDate,
    user,
    rdvsWithoutActivite,
  } = await data

  if (activitesByDate.length === 0 && !isFiltered) {
    return <MesActivitesListeEmptyPage />
  }

  const baseHref = '/coop/mes-activites'
  return (
    <>
      <p className="fr-text--bold fr-text--lg fr-mb-6v fr-mt-2v">
        {getActivitesResultCountLabel({
          isFiltered,
          searchResult,
          rdvsWithoutActivite,
        })}
      </p>
      {activitesByDate.map(({ date, activites }) => (
        <Fragment key={new Date(date).toISOString()}>
          <h3 className="fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase fr-mt-6v fr-mb-4v">
            {formatActiviteDayDate(date)}
          </h3>
          {activites.map((activite) =>
            'status' in activite ? (
              <RdvCard
                key={activite.id}
                activite={activite}
                user={user}
                displayBeneficiaire
              />
            ) : (
              <ActiviteCard
                key={activite.id}
                activite={activite}
                variant="with-beneficiaire"
              />
            ),
          )}
        </Fragment>
      ))}
      <PaginationNavWithPageSizeSelect
        className="fr-mt-12v"
        totalPages={searchResult.totalPages}
        baseHref={baseHref}
        searchParams={searchParams}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        pageSizeOptions={pageSizeOptions}
      />
    </>
  )
}

const MesActivitesListePage = ({
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

export default MesActivitesListePage
