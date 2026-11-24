import { Sort } from '@arckit/resultset'
import { composerLEtat } from '@/libraries/etat-d-url/definition/composition'
import { pagination } from '@/libraries/etat-d-url/definition/pagination'
import { rechercheLibre } from '@/libraries/etat-d-url/definition/recherche-libre'
import { triParmi } from '@/libraries/etat-d-url/definition/tri-parmi'
import type { ColonneDesEmployeuses } from '../../domain/lister-employeuses'

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
