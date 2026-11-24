import type { AdresseCourante } from '@/libraries/etat-d-url/definition/composition'
import { filtreDeRecherche } from '@/libraries/etat-d-url/definition/filtre-de-recherche'
import { pagination } from '@/libraries/etat-d-url/definition/pagination'
import { CodeInsee } from '@/libraries/insee'

export const filtreDesCommunesDuReseau = filtreDeRecherche({
  titre: 'Communes',
  prefixe: 'Commune : ',
  cle: 'communes',
  schema: CodeInsee.schema,
})

export const paginationDuReseau = pagination({
  lignes: [20, 50, 100],
  parDefaut: 20,
})

export type ParametresDuReseau = AdresseCourante['parametres']
