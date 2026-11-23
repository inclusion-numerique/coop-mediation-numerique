import type { BuildStatistiquesWorksheetInput } from './classeur-des-statistiques'
import type { ActivitesFilters } from './filtres/barre/parametres-de-la-barre'
import { generateActivitesFiltersLabels } from './filtres/filtres.labels'

type OptionsDesLibelles = Parameters<typeof generateActivitesFiltersLabels>[1]

type StatistiquesDeLaPage = BuildStatistiquesWorksheetInput['statistiques'] &
  Omit<OptionsDesLibelles, 'beneficiairesOptions' | 'mediateursOptions'> & {
    readonly initialBeneficiairesOptions: OptionsDesLibelles['beneficiairesOptions']
    readonly initialMediateursOptions: OptionsDesLibelles['mediateursOptions']
  }

export const entreeDuClasseur = ({
  statistiques,
  filters,
  auteur,
  fuseau,
}: {
  statistiques: StatistiquesDeLaPage
  filters: ActivitesFilters
  auteur: BuildStatistiquesWorksheetInput['auteur']
  fuseau: string
}): BuildStatistiquesWorksheetInput => ({
  statistiques,
  auteur,
  filters: generateActivitesFiltersLabels(filters, {
    communesOptions: statistiques.communesOptions,
    departementsOptions: statistiques.departementsOptions,
    lieuxActiviteOptions: statistiques.lieuxActiviteOptions,
    beneficiairesOptions: statistiques.initialBeneficiairesOptions,
    mediateursOptions: statistiques.initialMediateursOptions,
    structuresEmployeusesOptions: statistiques.structuresEmployeusesOptions,
    tagsOptions: statistiques.tagsOptions,
    activiteSourceOptions: statistiques.activiteSourceOptions,
    vocabulaire: statistiques.vocabulaire,
  }),
  fuseau,
})
