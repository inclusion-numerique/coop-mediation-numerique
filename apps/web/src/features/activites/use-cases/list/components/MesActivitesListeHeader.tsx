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
  lieuxActiviteOptions,
  searchResultMatchesCount,
  activiteDates,
}: {
  defaultFilters: ActivitesFilters
  initialMediateursOptions: MediateurOption[]
  initialBeneficiairesOptions: BeneficiaireOption[]
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
        'fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v',
        className,
      )}
    >
      <Filters
        className="fr-mt-0-5v"
        defaultFilters={defaultFilters}
        initialMediateursOptions={initialMediateursOptions}
        initialBeneficiairesOptions={initialBeneficiairesOptions}
        communesOptions={communesOptions}
        departementsOptions={departementsOptions}
        lieuxActiviteOptions={lieuxActiviteOptions}
        minDate={activiteDates.first ?? new Date()}
        isCoordinateur={false}
        isMediateur={true}
        enableRdvsFilter
      />
      <Suspense fallback={<ExportActivitesDisabledButton />}>
        <ExportActivitesButtonWrapper
          filters={defaultFilters}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
          beneficiairesOptions={initialBeneficiairesOptions}
          mediateursOptions={initialMediateursOptions}
          searchResultMatchesCount={searchResultMatchesCount}
        />
      </Suspense>
    </div>
    <hr className="fr-mt-6v fr-pb-3v" />
    <FilterTags
      filters={defaultFilters}
      communesOptions={communesOptions}
      departementsOptions={departementsOptions}
      lieuxActiviteOptions={lieuxActiviteOptions}
      beneficiairesOptions={initialBeneficiairesOptions}
      mediateursOptions={initialMediateursOptions}
    />
  </>
)

export default MesActivitesListeHeader
