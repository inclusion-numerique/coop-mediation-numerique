import type { Affectation } from '../affectation/affectation'
import type { Contrat } from '../affectation/contrat'
import { PeriodeEmploi } from '../affectation/periode-emploi'
import type { Employeuse } from '../employeuse'
import type { AffectationActuelle } from './employeuse-actuelle'

export type ContratLu = {
  readonly employeuse: Employeuse
  readonly debut: Date | null
  readonly fin: Date | null
  readonly rupture: Date | null
}

export type EmploiActuelLu = {
  readonly affectationActuelle: AffectationActuelle | null
  readonly contrats: readonly ContratLu[]
}

export type HistoriqueDEmploiLu = {
  readonly affectations: readonly Affectation[]
  readonly contrats: readonly ContratLu[]
}

export const contratsAuMoment = (
  contrats: readonly ContratLu[],
  maintenant: Date,
): readonly Contrat[] =>
  contrats.map(({ employeuse, debut, fin, rupture }) => ({
    employeuse,
    periode: PeriodeEmploi({ debut, fin, rupture, maintenant }),
  }))
