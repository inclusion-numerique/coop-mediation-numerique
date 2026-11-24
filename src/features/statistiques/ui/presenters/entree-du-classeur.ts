import type { ActivitesFilters } from '@/features/statistiques/domain/filtres-des-activites'
import type { AuteurDExport } from '@/libraries/tableur/addExportMetadata'
import { generateActivitesFiltersLabels } from '../labels/filtres.labels'

type OptionsDesLibelles = Parameters<typeof generateActivitesFiltersLabels>[1]

type OptionsDeLaPage = Omit<
  OptionsDesLibelles,
  'beneficiairesOptions' | 'mediateursOptions'
> & {
  readonly initialBeneficiairesOptions: OptionsDesLibelles['beneficiairesOptions']
  readonly initialMediateursOptions: OptionsDesLibelles['mediateursOptions']
}

export const entreeDuClasseur = <Statistiques extends OptionsDeLaPage>({
  statistiques,
  filters,
  auteur,
  fuseau,
}: {
  statistiques: Statistiques
  filters: ActivitesFilters
  auteur: AuteurDExport
  fuseau: string
}) => ({
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
