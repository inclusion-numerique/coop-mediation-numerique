import { Sort } from '@arckit/resultset'
import { composerLEtat, pagination, triParmi } from '@/libraries/etat-d-url'
import type { ColonneDesTags } from '../../domain'

export const triDesTags = triParmi({
  colonnes: ['nom', 'visibilite'] satisfies readonly ColonneDesTags[],
  parDefaut: Sort('nom', 'asc'),
})

export const paginationDesTags = pagination({
  lignes: [10, 20, 50, 100],
  parDefaut: 50,
})

export const listeDesTags = composerLEtat(triDesTags, paginationDesTags)
