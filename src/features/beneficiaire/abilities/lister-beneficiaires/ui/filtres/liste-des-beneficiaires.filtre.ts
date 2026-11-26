import { type Paginated, Sort } from '@arckit/resultset'
import {
  type AdresseCourante,
  composerLEtat,
  pagination,
  rechercheLibre,
  triParmi,
} from '@/libraries/etat-d-url'
import type { ColonneTriableDesBeneficiaires } from '../../domain/lister-beneficiaires'

const CHEMIN_DES_BENEFICIAIRES = '/coop/mes-beneficiaires'

export const colonnesTriablesDesBeneficiaires = [
  'nom',
  'prenom',
  'anneeNaissance',
  'accompagnementsCount',
] as const satisfies readonly ColonneTriableDesBeneficiaires[]

export const paginationDesBeneficiaires = pagination({
  lignes: [10, 20, 50, 100],
  parDefaut: 20,
})

const listeDesBeneficiaires = composerLEtat(
  rechercheLibre,
  triParmi({
    colonnes: colonnesTriablesDesBeneficiaires,
    parDefaut: Sort('nom', 'asc'),
  }),
  paginationDesBeneficiaires,
)

export const requeteDesBeneficiaires = (
  parametres: AdresseCourante['parametres'],
) => {
  const {
    recherche,
    tri,
    pagination: lue,
  } = listeDesBeneficiaires.charger(parametres)
  return {
    ...(recherche === '' ? {} : { search: recherche }),
    sort: tri,
    ...lue,
  }
}

export const liensDeLaListe = (
  parametres: AdresseCourante['parametres'],
  resultat: Paginated<unknown>,
) => {
  const adresse = { chemin: CHEMIN_DES_BENEFICIAIRES, parametres }
  return {
    colonnes: listeDesBeneficiaires.tri.liens(
      adresse,
      listeDesBeneficiaires.charger(parametres),
    ),
    pages: listeDesBeneficiaires.pagination.liens(adresse, resultat),
  }
}

export type LiensDeLaListe = ReturnType<typeof liensDeLaListe>
