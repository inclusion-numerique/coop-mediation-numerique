import type { ActivitesFilters } from '@/features/statistiques/domain/filtres-des-activites'
import { validateActivitesFilters } from './parametres-de-la-barre.search-params'

export type ParametresDeLaPage = ActivitesFilters & {
  graphique_fin?: string
}

export const parametresDesStatistiques = (parametres: ParametresDeLaPage) => ({
  activitesFilters: validateActivitesFilters(parametres),
  graphOptions: {
    fin: parametres.graphique_fin
      ? new Date(parametres.graphique_fin)
      : undefined,
  },
})

export const parametresDesStatistiquesPartagees = (
  parametres: ParametresDeLaPage,
  aujourdhui: Date = new Date(),
) =>
  parametresDesStatistiques({
    ...parametres,
    beneficiaires: undefined,
    au: parametres.au ?? aujourdhui.toISOString().slice(0, 10),
  })
