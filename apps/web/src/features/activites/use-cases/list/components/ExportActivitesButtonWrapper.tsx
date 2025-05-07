import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import ExportActivitesButton from './ExportActivitesButton'
import ExportActivitesDisabledButton from './ExportActivitesDisabledButton'
import { generateActivitesFiltersLabels } from './generateActivitesFiltersLabels'

const ExportActivitesButtonWrapper = async ({
  lieuxActiviteOptions,
  beneficiairesOptions,
  mediateursOptions,
  departementsOptions,
  communesOptions,
  filters,
  searchResultMatchesCount,
}: {
  filters: ActivitesFilters
  beneficiairesOptions: BeneficiaireOption[]
  mediateursOptions: MediateurOption[]
  communesOptions: SelectOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  departementsOptions: SelectOption[]
  searchResultMatchesCount: Promise<number>
}) => {
  const filterLabels = generateActivitesFiltersLabels(filters, {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions,
    mediateursOptions,
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

export default ExportActivitesButtonWrapper
