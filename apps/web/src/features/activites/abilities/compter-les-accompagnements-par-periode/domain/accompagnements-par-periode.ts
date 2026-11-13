import type { Effectif, Jour } from '../../../domain'
import type { Mois } from './mois'

export type AccompagnementsParPeriode = {
  readonly parJour: readonly {
    readonly jour: Jour
    readonly nombre: Effectif
  }[]
  readonly parMois: readonly {
    readonly mois: Mois
    readonly nombre: Effectif
  }[]
}
