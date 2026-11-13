import { getMesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import type { SessionUser } from '@app/web/auth/sessionUser'
import type { ActivitesFilters } from '@app/web/features/statistiques/domain/filtres-des-statistiques'
import { generateActivitesFiltersLabels } from '@app/web/features/statistiques/ui/filtres/libelles-des-filtres'
import type { BuildStatistiquesWorksheetInput } from '@app/web/worksheet/statistiques/buildStatistiquesWorksheet'

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
  })

  return {
    statistiques,
    user,
    mediateur: user,
    filters: activitesFiltersLabels,
  }
}
