import { Sort } from '@arckit/resultset'
import {
  type AdresseCourante,
  composerLEtat,
  pagination,
  rechercheLibre,
  triParmi,
} from '@/libraries/etat-d-url'
import {
  COLONNES_TRIABLES,
  type CriteresDeLaListe,
} from '../../domain/criteres-de-la-liste'
import type { PageDeLieux } from '../../domain/ligne-de-la-liste'

const CHEMIN_DES_LIEUX = '/administration/lieux-activite'

export const paginationDesLieux = pagination({
  lignes: [10, 20, 50, 100, 250, 500, 1000],
  parDefaut: 100,
})

const listeDesLieux = composerLEtat(
  rechercheLibre,
  triParmi({ colonnes: COLONNES_TRIABLES, parDefaut: Sort('nom', 'asc') }),
  paginationDesLieux,
)

export const criteresDeLaListe = (
  parametres: AdresseCourante['parametres'],
): CriteresDeLaListe => {
  const { recherche, tri, pagination: lue } = listeDesLieux.charger(parametres)
  return { recherche, tri, ...lue }
}

export const liensDeLaListe = (
  parametres: AdresseCourante['parametres'],
  resultat: PageDeLieux,
) => {
  const adresse = { chemin: CHEMIN_DES_LIEUX, parametres }
  return {
    colonnes: listeDesLieux.tri.liens(
      adresse,
      listeDesLieux.charger(parametres),
    ),
    pages: listeDesLieux.pagination.liens(adresse, resultat),
  }
}

export type LiensDeLaListe = ReturnType<typeof liensDeLaListe>
