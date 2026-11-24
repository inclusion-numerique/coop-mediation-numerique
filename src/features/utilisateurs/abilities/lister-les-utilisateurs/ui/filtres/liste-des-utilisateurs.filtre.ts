import { Sort } from '@arckit/resultset'
import { composerLEtat } from '@/libraries/etat-d-url/definition/composition'
import { pagination } from '@/libraries/etat-d-url/definition/pagination'
import { triParmi } from '@/libraries/etat-d-url/definition/tri-parmi'
import { colonnesTriables } from '../../domain'

export const paginationDesUtilisateurs = pagination({
  lignes: [10, 20, 50, 100, 250, 500, 1000],
  parDefaut: 100,
})

export const listeDesUtilisateurs = composerLEtat(
  triParmi({
    colonnes: colonnesTriables,
    parDefaut: Sort('creation', 'desc'),
  }),
  paginationDesUtilisateurs,
)

export const CHEMIN_DES_UTILISATEURS = '/administration/utilisateurs'
