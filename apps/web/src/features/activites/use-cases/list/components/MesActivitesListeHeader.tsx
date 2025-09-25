import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import classNames from 'classnames'
import { Suspense } from 'react'
import type { ActiviteDates } from '../db/getFirstAndLastActiviteDate'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import ExportActivitesButtonWrapper from './ExportActivitesButtonWrapper'
import ExportActivitesDisabledButton from './ExportActivitesDisabledButton'
import Filters from './Filters'
import { FilterTags } from './FilterTags'

const MesActivitesListeHeader = ({
  className,
  communesOptions,
  defaultFilters,
  departementsOptions,
  initialMediateursOptions,
  tagsOptions,
  lieuxActiviteOptions,
  searchResultMatchesCount,
  activiteSourceOptions,
  activiteDates,
  enableRdvsFilter,
  hasCrasV1,
}: {
  defaultFilters: ActivitesFilters
  initialMediateursOptions: MediateurOption[]
  tagsOptions: { id: string; nom: string }[]
  communesOptions: SelectOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  departementsOptions: SelectOption[]
  activiteDates: ActiviteDates
  activiteSourceOptions: SelectOption[]
  className?: string
  searchResultMatchesCount: Promise<number>
  enableRdvsFilter: boolean
  hasCrasV1: boolean
}) => (
  <>
    <div
      className={classNames(
        'fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mb-6v',
        className,
      )}
    >
      <Filters
        defaultFilters={defaultFilters}
        initialMediateursOptions={initialMediateursOptions}
        beneficiairesFilter={false}
        initialBeneficiairesOptions={[]}
        communesOptions={communesOptions}
        departementsOptions={departementsOptions}
        lieuxActiviteOptions={lieuxActiviteOptions}
        tagsOptions={[]}
        minDate={activiteDates.first ?? new Date()}
        isCoordinateur={false}
        isMediateur={true}
        enableRdvsFilter={enableRdvsFilter}
        hasCrasV1={hasCrasV1}
      />
      <Suspense fallback={<ExportActivitesDisabledButton />}>
        <ExportActivitesButtonWrapper
          filters={defaultFilters}
          tagsOptions={tagsOptions}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
          beneficiairesOptions={[]}
          mediateursOptions={initialMediateursOptions}
          searchResultMatchesCount={searchResultMatchesCount}
          activiteSourceOptions={activiteSourceOptions}
        />
      </Suspense>
    </div>
    <FilterTags
      filters={defaultFilters}
      communesOptions={communesOptions}
      departementsOptions={departementsOptions}
      lieuxActiviteOptions={lieuxActiviteOptions}
      beneficiairesOptions={[]}
      mediateursOptions={initialMediateursOptions}
      tagsOptions={tagsOptions}
      activiteSourceOptions={activiteSourceOptions}
    />
  </>
)

export default MesActivitesListeHeader
