import type { Paginated } from '@arckit/resultset'
import type { AdresseCourante } from '@/libraries/etat-d-url'
import { listeDesEmployeuses } from '../filtres/liste-des-employeuses.filtre'

export const CHEMIN_DES_EMPLOYEUSES = '/administration/structures-employeuses'

export const barreDesEmployeuses = (
  parametres: AdresseCourante['parametres'],
  resultat: Paginated<unknown>,
) => {
  const adresse = { chemin: CHEMIN_DES_EMPLOYEUSES, parametres }
  return {
    colonnes: listeDesEmployeuses.tri.liens(
      adresse,
      listeDesEmployeuses.charger(parametres),
    ),
    pages: listeDesEmployeuses.pagination.liens(adresse, resultat),
  }
}

export type BarreDesEmployeuses = ReturnType<typeof barreDesEmployeuses>
