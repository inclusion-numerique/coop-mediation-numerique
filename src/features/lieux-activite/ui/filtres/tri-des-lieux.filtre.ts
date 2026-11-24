import { Sort } from '@arckit/resultset'
import { composerLEtat } from '@/libraries/etat-d-url/definition/composition'
import { triParmi } from '@/libraries/etat-d-url/definition/tri-parmi'
import type { ColonneDesLieux } from '../../domain/tri-des-lieux'

export const triDesLieux = triParmi({
  colonnes: ['nom', 'modification'] satisfies readonly ColonneDesLieux[],
  parDefaut: Sort('nom', 'asc'),
})

export const triDesLieuxLu = composerLEtat(triDesLieux)
