import type { SessionUser } from '@app/web/auth/sessionUser'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import { mediateurCoordonnesIdsFor } from '@app/web/mediateurs/mediateurCoordonnesIdsFor'
import { generateActivitesFiltersLabels } from '../components/generateActivitesFiltersLabels'
import { addTimezoneToActivite } from '../db/addTimezoneToActivite'
import { searchActivite } from '../db/searchActivite'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import type { BuildActivitesWorksheetInput } from './buildAccompagnementsWorksheet'

export const getAccompagenmentsWorksheetInput = async ({
  user,
  filters,
  mediateurIds,
  hasCraV1,
}: {
  user: SessionUser
  filters: ActivitesFilters
  mediateurIds: string[]
  hasCraV1: boolean
}): Promise<BuildActivitesWorksheetInput> => {
  const mediateurCoordonnesIds = mediateurCoordonnesIdsFor(user)

  const { activites, totalPages } = await searchActivite({
    mediateurIds,
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
    activiteSourceOptions,
  } = await getFiltersOptionsForMediateur({
    user,
    mediateurCoordonnesIds,
    includeBeneficiaireIds: filters.beneficiaires,
  })

  const activitesFiltersLabels = generateActivitesFiltersLabels(filters, {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions: initialBeneficiairesOptions,
    mediateursOptions: initialMediateursOptions,
    tagsOptions,
    activiteSourceOptions,
  })

  return {
    activites: activites.map(addTimezoneToActivite(user)),
    user,
    mediateur: user,
    filters: activitesFiltersLabels,
    hasCraV1,
  }
}
