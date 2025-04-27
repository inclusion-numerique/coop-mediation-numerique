import { SessionUser } from '@app/web/auth/sessionUser'
import { getCommunesAndDepartementsOptions } from '@app/web/features/lieux-activite/getCommunesAndDepartementsOptions'
import { getLieuxActiviteOptions } from '@app/web/features/lieux-activite/getLieuxActiviteOptions'
import { generateUtilisateursFiltersLabels } from '../filter/generateUtilisateursFiltersLabels'
import {
  UtilisateursFilters,
  utilisateursFilters,
} from '../filter/utilisateursFilters'
import { UtilisateursDataTableSearchParams } from '../list/UtilisateursDataTable'
import { searchUtilisateur } from '../search/searchUtilisateur'
import type { BuildUtilisateursWorksheetInput } from './buildUtilisateursWorksheet'

export const getUtilisateursWorksheetInput = async ({
  user,
  filters,
}: {
  user: SessionUser
  filters: UtilisateursDataTableSearchParams
}): Promise<BuildUtilisateursWorksheetInput> => {
  const { utilisateurs, totalPages } = await searchUtilisateur({
    searchParams: {
      ...filters,
      lignes: '10000000',
    },
  })

  if (totalPages > 1) {
    throw new Error('Export should not be paginated')
  }

  const { communesOptions, departementsOptions } =
    await getCommunesAndDepartementsOptions()

  const lieuxActiviteOptions = await getLieuxActiviteOptions()

  const utilisateursFiltersLabels = generateUtilisateursFiltersLabels(
    utilisateursFilters(filters as UtilisateursFilters),
    {
      communesOptions,
      departementsOptions,
      lieuxActiviteOptions,
    },
  )

  return {
    utilisateurs,
    user,
    filters: utilisateursFiltersLabels,
  }
}
