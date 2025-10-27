import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { Spinner } from '@app/web/ui/Spinner'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import React, { Suspense } from 'react'
import { CoordinationEmptyState } from './components/CoordinationEmptyState'
import ActiviteCoordinationModal from './components/coordination/ActiviteCoordinationDynamicModal'
import { CoordinationListCard } from './components/coordination/CoordinationListCard'
import { ActivitesByDate } from './db/getCoordinationsListPageData'

type CoordinationListePageData = {
  activitesByDate: ActivitesByDate[]
  searchParams: { page?: string; lignes?: string }
  searchResult: { totalPages: number; totalCount: number }
  timezone: string
}

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

const SuspensedContent = async ({
  data,
}: {
  data: Promise<CoordinationListePageData>
}) => {
  const { searchParams, searchResult, activitesByDate, timezone } = await data

  return activitesByDate.length === 0 ? (
    <CoordinationEmptyState />
  ) : (
    <div>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full fr-my-6v">
        <h2 className="fr-text--bold fr-text--lg fr-mb-0">
          {`${searchResult.totalCount} activité${sPluriel(searchResult.totalCount)} enregistrée${sPluriel(searchResult.totalCount)}`}
        </h2>
      </div>
      <ActiviteCoordinationModal timezone={timezone} />
      {activitesByDate.map(({ date, activites }) => (
        <div key={date} className="fr-mb-8v">
          <h3 className="fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase fr-mt-6v fr-mb-4v">
            {formatActiviteDayDate(date)}
          </h3>
          {activites.map((activite) => (
            <CoordinationListCard
              key={activite.id}
              activite={activite}
              date={date}
              timezone={timezone}
            />
          ))}
        </div>
      ))}
      <PaginationNavWithPageSizeSelect
        className="fr-mt-12v"
        totalPages={searchResult.totalPages}
        baseHref={'/coop/mes-coordinations'}
        searchParams={searchParams}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  )
}

const MesCoordinationsListePage = ({
  data,
}: {
  data: Promise<CoordinationListePageData>
}) => (
  <Suspense fallback={<Spinner className="fr-mt-6v" />}>
    <SuspensedContent data={data} />
  </Suspense>
)
export default MesCoordinationsListePage
