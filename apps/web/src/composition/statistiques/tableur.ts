import type { SessionUser } from '@app/web/auth/sessionUser'
import { generateActivitesFiltersLabels } from '@app/web/features/statistiques/ui/filtres/libelles-des-filtres'
import type { ActivitesFilters } from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import type { BuildStatistiquesWorksheetInput } from '@app/web/features/statistiques/ui/tableur/classeur-des-statistiques'
import { getMesStatistiquesPageData } from './mes-statistiques'

export const getStatistiquesWorksheetInput = async ({
  user,
  filters,
}: {
  user: SessionUser
  filters: ActivitesFilters
}): Promise<BuildStatistiquesWorksheetInput> => {
  const statistiques = await getMesStatistiquesPageData({
    user,
    activitesFilters: filters,
  })

  const activitesFiltersLabels = generateActivitesFiltersLabels(filters, {
    communesOptions: statistiques.communesOptions,
    departementsOptions: statistiques.departementsOptions,
    lieuxActiviteOptions: statistiques.lieuxActiviteOptions,
    beneficiairesOptions: statistiques.initialBeneficiairesOptions,
    mediateursOptions: statistiques.initialMediateursOptions,
    structuresEmployeusesOptions: statistiques.structuresEmployeusesOptions,
    tagsOptions: statistiques.tagsOptions,
    activiteSourceOptions: statistiques.activiteSourceOptions,
    vocabulaire: statistiques.vocabulaire,
  })

  return {
    statistiques,
    user,
    mediateur: user,
    filters: activitesFiltersLabels,
    fuseau: user.timezone,
  }
}
