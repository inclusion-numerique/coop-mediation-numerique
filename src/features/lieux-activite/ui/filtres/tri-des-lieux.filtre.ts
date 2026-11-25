import { Sort } from '@arckit/resultset'
import { composerLEtat, triParmi } from '@/libraries/etat-d-url'
import type { ColonneDesLieux } from '../../domain/tri-des-lieux'

export const triDesLieux = triParmi({
  colonnes: ['nom', 'modification'] satisfies readonly ColonneDesLieux[],
  parDefaut: Sort('nom', 'asc'),
})

export const triDesLieuxLu = composerLEtat(triDesLieux)
