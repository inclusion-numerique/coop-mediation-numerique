import type { CriteresDesActivites } from '../consultation/criteres-des-activites'
import { Jour } from '../jour'

export type PeriodeDesStatistiques = {
  readonly du: Jour | null
  readonly au: Jour | null
}

export type CriteresDesStatistiques = Omit<CriteresDesActivites, 'periode'> & {
  readonly periode: PeriodeDesStatistiques
}
