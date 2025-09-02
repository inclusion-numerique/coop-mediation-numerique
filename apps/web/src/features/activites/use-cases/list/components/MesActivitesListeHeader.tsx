import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import classNames from 'classnames'
import { Suspense } from 'react'
import type { ActiviteDates } from '../db/getFirstAndLastActiviteDate'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import ExportActivitesButtonWrapper from './ExportActivitesButtonWrapper'
import ExportActivitesDisabledButton from './ExportActivitesDisabledButton'
import { FilterTags } from './FilterTags'
import Filters from './Filters'

const MesActivitesListeHeader = ({
  className,
  communesOptions,
  defaultFilters,
  departementsOptions,
  initialMediateursOptions,
  initialBeneficiairesOptions,
  tagsOptions,
  lieuxActiviteOptions,
  searchResultMatchesCount,
  activiteDates,
}: {
  defaultFilters: ActivitesFilters
  initialMediateursOptions: MediateurOption[]
  initialBeneficiairesOptions: BeneficiaireOption[]
  tagsOptions: { id: string; nom: string }[]
  communesOptions: SelectOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  departementsOptions: SelectOption[]
  activiteDates: ActiviteDates
  className?: string
  searchResultMatchesCount: Promise<number>
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
        initialBeneficiairesOptions={initialBeneficiairesOptions}
        tagsOptions={[]}
        minDate={activiteDates.first ?? new Date()}
        isCoordinateur={false}
        isMediateur={true}
        enableRdvsFilter
      />
      <Suspense fallback={<ExportActivitesDisabledButton />}>
        <ExportActivitesButtonWrapper
          filters={defaultFilters}
          tagsOptions={tagsOptions}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
          beneficiairesOptions={initialBeneficiairesOptions}
          mediateursOptions={initialMediateursOptions}
          searchResultMatchesCount={searchResultMatchesCount}
        />
      </Suspense>
    </div>
    <FilterTags
      filters={defaultFilters}
      communesOptions={communesOptions}
      departementsOptions={departementsOptions}
      lieuxActiviteOptions={lieuxActiviteOptions}
      beneficiairesOptions={initialBeneficiairesOptions}
      mediateursOptions={initialMediateursOptions}
      tagsOptions={tagsOptions}
    />
  </>
)

export default MesActivitesListeHeader
