import type { SessionUser } from '@app/web/auth/sessionUser'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import { generateActivitesFiltersLabels } from '../components/generateActivitesFiltersLabels'
import { ActiviteListItem } from '../db/activitesQueries'
import { searchActivite } from '../db/searchActivite'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import type { BuildActivitesWorksheetInput } from './buildAccompagnementsWorksheet'

export const getAccompagenmentsWorksheetInput = async ({
  user,
  filters,
}: {
  user: SessionUser
  filters: ActivitesFilters
}): Promise<BuildActivitesWorksheetInput> => {
  const { activites, totalPages } = await searchActivite({
    mediateurId: user.mediateur?.id,
    beneficiaireIds: filters.beneficiaires,
    searchParams: {
      ...filters,
      lignes: '10000000',
    },
  })

  if (totalPages > 1) {
    throw new Error('Export should not be paginated')
  }

  const {
    communesOptions,
    departementsOptions,
    initialBeneficiairesOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    tagsOptions,
  } = await getFiltersOptionsForMediateur({
    user,
    includeBeneficiaireIds: filters.beneficiaires,
  })

  const activitesFiltersLabels = generateActivitesFiltersLabels(filters, {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions: initialBeneficiairesOptions,
    mediateursOptions: initialMediateursOptions,
    tagsOptions,
  })

  return {
    activites: activites.map(
      (activite) =>
        ({
          ...activite,
          timezone: user.timezone,
        }) satisfies ActiviteListItem,
    ),
    user,
    mediateur: user,
    filters: activitesFiltersLabels,
  }
}
