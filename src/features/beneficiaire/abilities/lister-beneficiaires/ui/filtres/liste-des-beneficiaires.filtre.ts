import { type Paginated, Sort } from '@arckit/resultset'
import {
  type AdresseCourante,
  composerLEtat,
} from '@/libraries/etat-d-url/definition/composition'
import { pagination } from '@/libraries/etat-d-url/definition/pagination'
import { rechercheLibre } from '@/libraries/etat-d-url/definition/recherche-libre'
import { triParmi } from '@/libraries/etat-d-url/definition/tri-parmi'
import { beneficiaireSortFields } from '../../domain/lister-beneficiaires'

const CHEMIN_DES_BENEFICIAIRES = '/coop/mes-beneficiaires'

export const paginationDesBeneficiaires = pagination({
  lignes: [10, 20, 50, 100],
  parDefaut: 20,
})

const listeDesBeneficiaires = composerLEtat(
  rechercheLibre,
  triParmi({ colonnes: beneficiaireSortFields, parDefaut: Sort('nom', 'asc') }),
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
    search: recherche === '' ? undefined : recherche,
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
