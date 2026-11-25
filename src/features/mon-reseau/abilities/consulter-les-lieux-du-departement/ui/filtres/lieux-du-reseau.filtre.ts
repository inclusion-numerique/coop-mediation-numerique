import { Sort } from '@arckit/resultset'
import type { AdresseCourante } from '@/libraries/etat-d-url'
import { composerLEtat, rechercheLibre, triParmi } from '@/libraries/etat-d-url'
import {
  filtreDesCommunesDuReseau,
  type ParametresDuReseau,
  paginationDuReseau,
} from '../../../../ui/filtres/reseau.filtre'
import type { ColonneDesLieuxDuReseau, CriteresDesLieux } from '../../domain'

export const filtresDesLieuxDuReseau = composerLEtat(
  rechercheLibre,
  filtreDesCommunesDuReseau,
)

export const triDesLieuxDuReseau = triParmi({
  colonnes: [
    'nom',
    'modification',
  ] satisfies readonly ColonneDesLieuxDuReseau[],
  parDefaut: Sort('nom', 'asc'),
})

const listeDesLieuxDuReseau = composerLEtat(
  triDesLieuxDuReseau,
  paginationDuReseau,
)

export const criteresDesLieuxDuReseau = (
  parametres: ParametresDuReseau,
): CriteresDesLieux => {
  const { recherche, communes } = filtresDesLieuxDuReseau.charger(parametres)
  const { tri, pagination } = listeDesLieuxDuReseau.charger(parametres)
  return { recherche, communes, tri, ...pagination }
}

export const pagesDesLieuxDuReseau = (
  adresse: AdresseCourante,
  resultat: { totalItems: number; currentPage: number; pageSize: number },
) => listeDesLieuxDuReseau.pagination.liens(adresse, resultat)
