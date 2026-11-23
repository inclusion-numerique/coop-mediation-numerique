import { premiereValeur, valeurLue } from '@/libraries/parametres-d-url'
import {
  type CriteresDesActivites,
  criteresDesActivites,
  type ParametresDesActivites,
} from '../consultation/criteres-des-activites'
import { Jour } from '../jour'

export type PeriodeDesStatistiques = {
  readonly du: Jour | null
  readonly au: Jour | null
}

export type CriteresDesStatistiques = Omit<CriteresDesActivites, 'periode'> & {
  readonly periode: PeriodeDesStatistiques
}

export const criteresDesStatistiques = (
  parametres: ParametresDesActivites,
): CriteresDesStatistiques => ({
  ...criteresDesActivites(parametres),
  periode: {
    du: valeurLue(Jour.schema, premiereValeur(parametres.du)),
    au: valeurLue(Jour.schema, premiereValeur(parametres.au)),
  },
})
