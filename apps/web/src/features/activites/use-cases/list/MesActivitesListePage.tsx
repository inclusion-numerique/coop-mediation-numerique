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
import UpdateIncludeRdvsInActivitesList from './components/UpdateIncludeRdvsInActivitesList'
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

  const hasRdvIntegration = !!user.rdvAccount?.hasOauthTokens

  const baseHref = '/coop/mes-activites'
  return (
    <>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full fr-my-6v">
        <h2 className="fr-text--bold fr-text--lg fr-mb-0">
          {getActivitesResultCountLabel({
            isFiltered,
            searchResult,
          })}
        </h2>
        {hasRdvIntegration && user.rdvAccount && (
          <UpdateIncludeRdvsInActivitesList
            rdvAccountId={user.rdvAccount.id}
            includeRdvsInActivitesList={
              user.rdvAccount.includeRdvsInActivitesList
            }
            syncDataOnLoad={
              user.rdvAccount.invalidWebhookOrganisationIds.length > 0
            }
            userId={user.id}
          />
        )}
      </div>
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
  <Suspense fallback={<Spinner className="fr-mt-6v" />}>
    <SuspensedContent data={data} />
  </Suspense>
)

export default MesActivitesListePage
