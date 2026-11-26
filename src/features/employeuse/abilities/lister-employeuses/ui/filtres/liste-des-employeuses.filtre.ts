import { Sort } from '@arckit/resultset'
import {
  composerLEtat,
  pagination,
  rechercheLibre,
  triParmi,
} from '@/libraries/etat-d-url'
import type { ColonneDesEmployeuses } from '../../domain/employeuse-listee'

const triDesEmployeuses = triParmi({
  colonnes: [
    'nom',
    'emplois',
    'creation',
    'modification',
  ] satisfies readonly ColonneDesEmployeuses[],
  parDefaut: Sort('nom', 'asc'),
})

export const paginationDesEmployeuses = pagination({
  lignes: [10, 20, 50, 100, 250, 500, 1000],
  parDefaut: 100,
})

export const listeDesEmployeuses = composerLEtat(
  rechercheLibre,
  triDesEmployeuses,
  paginationDesEmployeuses,
)
