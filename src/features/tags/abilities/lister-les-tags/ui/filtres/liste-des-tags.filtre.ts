import { Sort } from '@arckit/resultset'
import { composerLEtat } from '@/libraries/etat-d-url/definition/composition'
import { pagination } from '@/libraries/etat-d-url/definition/pagination'
import { triParmi } from '@/libraries/etat-d-url/definition/tri-parmi'
import type { ColonneDesTags } from '../../domain'

export const triDesTags = triParmi({
  colonnes: {
    nom: 'Nom',
    visibilite: 'Visibilité',
  } satisfies Record<ColonneDesTags, string>,
  parDefaut: Sort('nom', 'asc'),
})

export const paginationDesTags = pagination({
  lignes: [10, 20, 50, 100],
  parDefaut: 50,
})

export const listeDesTags = composerLEtat(triDesTags, paginationDesTags)
