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
  tagsOptions,
  filters,
  searchResultMatchesCount,
  activiteSourceOptions,
}: {
  filters: ActivitesFilters
  beneficiairesOptions: BeneficiaireOption[]
  mediateursOptions: MediateurOption[]
  communesOptions: SelectOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  departementsOptions: SelectOption[]
  tagsOptions: { id: string; nom: string }[]
  activiteSourceOptions: SelectOption[]
  searchResultMatchesCount: Promise<number>
}) => {
  const filterLabels = generateActivitesFiltersLabels(filters, {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions,
    mediateursOptions,
    tagsOptions,
    activiteSourceOptions,
  })

  const matchesCount = await searchResultMatchesCount

  if (matchesCount > 0) {
    return (
      <ExportActivitesButton
        filters={filters}
        filterLabelsToDisplay={filterLabels}
        accompagnementsCount={matchesCount}
      />
    )
  }

  return <ExportActivitesDisabledButton />
}

export default ExportActivitesButtonWrapper
