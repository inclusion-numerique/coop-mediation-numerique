import type { Paginated } from '@arckit/resultset'
import type { AdresseCourante } from '@/libraries/etat-d-url'
import {
  CHEMIN_DES_UTILISATEURS,
  listeDesUtilisateurs,
} from '../filtres/liste-des-utilisateurs.filtre'

export const liensDeLaListe = (
  parametres: AdresseCourante['parametres'],
  resultat: Paginated<unknown>,
) => {
  const adresse = { chemin: CHEMIN_DES_UTILISATEURS, parametres }
  return {
    colonnes: listeDesUtilisateurs.tri.liens(
      adresse,
      listeDesUtilisateurs.charger(parametres),
    ),
    pages: listeDesUtilisateurs.pagination.liens(adresse, resultat),
  }
}

export type LiensDeLaListe = ReturnType<typeof liensDeLaListe>
