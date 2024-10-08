import type { SelectOption } from '@app/ui/components/Form/utils/options'
import classNames from 'classnames'
import { Suspense } from 'react'
import ActivitesFilterTags from '@app/web/app/coop/mes-activites/(liste)/ActivitesFilterTags'
import type { ActivitesFilters } from '@app/web/cra/ActivitesFilters'
import type { BeneficiaireOption } from '@app/web/beneficiaire/BeneficiaireOption'
import ExportActivitesDisabledButton from '@app/web/app/coop/mes-activites/(liste)/ExportActivitesDisabledButton'
import ExportActivitesButton from '@app/web/app/coop/mes-activites/(liste)/ExportActivitesButton'
import { generateActivitesFiltersLabels } from '@app/web/cra/generateActivitesFiltersLabels'

const ExportActivitesButtonWrapper = async ({
  lieuxActiviteOptions,
  beneficiairesOptions,
  departementsOptions,
  communesOptions,
  filters,
  searchResultMatchesCount,
}: {
  filters: ActivitesFilters
  beneficiairesOptions: BeneficiaireOption[]
  communesOptions: SelectOption[]
  lieuxActiviteOptions: SelectOption[]
  departementsOptions: SelectOption[]
  searchResultMatchesCount: Promise<number>
}) => {
  const filterLabels = generateActivitesFiltersLabels(filters, {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions,
  })

  const matchesCount = await searchResultMatchesCount

  if (matchesCount > 0) {
    return (
      <ExportActivitesButton
        filters={filters}
        filterLabels={filterLabels}
        matchesCount={matchesCount}
      />
    )
  }

  return <ExportActivitesDisabledButton />
}

const MesActivitesListeHeader = ({
  className,
  communesOptions,
  defaultFilters,
  departementsOptions,
  initialBeneficiairesOptions,
  lieuxActiviteOptions,
  searchResultMatchesCount,
}: {
  defaultFilters: ActivitesFilters
  initialBeneficiairesOptions: BeneficiaireOption[]
  communesOptions: SelectOption[]
  lieuxActiviteOptions: SelectOption[]
  departementsOptions: SelectOption[]
  className?: string
  searchResultMatchesCount: Promise<number>
}) => (
  <div
    className={classNames(
      'fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v',
      className,
    )}
  >
    <ActivitesFilterTags
      className="fr-mt-0-5v"
      defaultFilters={defaultFilters}
      initialBeneficiairesOptions={initialBeneficiairesOptions}
      communesOptions={communesOptions}
      departementsOptions={departementsOptions}
      lieuxActiviteOptions={lieuxActiviteOptions}
    />
    <Suspense fallback={<ExportActivitesDisabledButton />}>
      <ExportActivitesButtonWrapper
        filters={defaultFilters}
        communesOptions={communesOptions}
        departementsOptions={departementsOptions}
        lieuxActiviteOptions={lieuxActiviteOptions}
        beneficiairesOptions={initialBeneficiairesOptions}
        searchResultMatchesCount={searchResultMatchesCount}
      />
    </Suspense>
  </div>
)

export default MesActivitesListeHeader
