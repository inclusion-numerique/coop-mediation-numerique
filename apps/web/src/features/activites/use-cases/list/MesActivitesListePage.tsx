import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { Spinner } from '@app/web/ui/Spinner'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import { Fragment, Suspense } from 'react'
import ActiviteCard from './components/ActiviteCard'
import { getActivitesResultCountLabel } from './components/getActivitesResultCountLabel'
import MesActivitesListeEmptyPage from './components/MesActivitesListeEmptyPage'
import RdvCard from './components/RdvCard'
import { addTimezoneToActivite } from './db/addTimezoneToActivite'
import { ActivitesListPageData } from './getActivitesListPageData'

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

const SuspensedContent = async ({
  data,
}: {
  data: Promise<ActivitesListPageData>
}) => {
  const { searchParams, searchResult, isFiltered, activitesByDate, user } =
    await data

  if (activitesByDate.length === 0 && !isFiltered) {
    return <MesActivitesListeEmptyPage />
  }

  const baseHref = '/coop/mes-activites'
  return (
    <>
      <p className="fr-text--bold fr-text--lg fr-my-6v">
        {getActivitesResultCountLabel({
          isFiltered,
          searchResult,
        })}
      </p>
      {activitesByDate.map(({ date, items }) => (
        <Fragment key={new Date(date).toISOString()}>
          <h3 className="fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase fr-mt-6v fr-mb-4v">
            {formatActiviteDayDate(date)}
          </h3>
          {items.map((item) =>
            item.kind === 'rdv' ? (
              <RdvCard
                key={item.id}
                rdv={item}
                user={user}
                displayBeneficiaire
              />
            ) : (
              <ActiviteCard
                key={item.id}
                activite={{ ...item, timezone: user.timezone }}
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
    <Suspense fallback={<Spinner className="fr-mt-6v" />}>
      <SuspensedContent data={data} />
    </Suspense>
  </>
)

export default MesActivitesListePage
