import { Sort } from '@arckit/resultset'
import type { AdresseCourante } from '@/libraries/etat-d-url'
import {
  composerLEtat,
  filtreDeChoixUnique,
  rechercheLibre,
  triParmi,
} from '@/libraries/etat-d-url'
import {
  filtreDesCommunesDuReseau,
  type ParametresDuReseau,
  paginationDuReseau,
} from '../../../../ui/filtres/reseau.filtre'
import { type CriteresActeurs, FiltreRole } from '../../domain'
import { LIBELLE_DU_ROLE } from '../presenters/acteurs.presenter'

export const filtreDuRoleDeLActeur = filtreDeChoixUnique({
  titre: 'Rôle',
  cle: 'role',
  choix: LIBELLE_DU_ROLE,
})

export const filtresDesActeursDuReseau = composerLEtat(
  rechercheLibre,
  filtreDesCommunesDuReseau,
  filtreDuRoleDeLActeur,
)

export const triDesActeursDuReseau = triParmi({
  colonnes: ['nom'],
  parDefaut: Sort('nom', 'asc'),
})

const listeDesActeursDuReseau = composerLEtat(
  triDesActeursDuReseau,
  paginationDuReseau,
)

export const criteresDesActeursDuReseau = (
  parametres: ParametresDuReseau,
): CriteresActeurs => {
  const { recherche, communes, role } =
    filtresDesActeursDuReseau.charger(parametres)
  const { tri, pagination } = listeDesActeursDuReseau.charger(parametres)
  return {
    recherche,
    communes,
    role: role === null ? null : FiltreRole(role),
    tri,
    ...pagination,
  }
}

export const pagesDesActeursDuReseau = (
  adresse: AdresseCourante,
  resultat: { totalItems: number; currentPage: number; pageSize: number },
) => listeDesActeursDuReseau.pagination.liens(adresse, resultat)
