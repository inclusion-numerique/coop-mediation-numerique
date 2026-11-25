import type { AdresseCourante } from '@/libraries/etat-d-url'
import { filtreDeRecherche, pagination } from '@/libraries/etat-d-url'
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
