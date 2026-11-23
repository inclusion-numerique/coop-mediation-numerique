import type { ActivitesFilters } from '@/features/statistiques/domain/filtres-des-activites'
import type { BuildStatistiquesWorksheetInput } from '../../implementations/excel/classeur-des-statistiques'
import { generateActivitesFiltersLabels } from '../labels/filtres.labels'

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
