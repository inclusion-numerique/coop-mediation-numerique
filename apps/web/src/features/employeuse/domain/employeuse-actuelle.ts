import { type Affectation, affectationActuelle } from './affectation'
import type { Contrat } from './contrat'
import type { Employeuse } from './employeuse'
import type { PeriodeEmploi } from './periode-emploi'
import type { SourceAffectation } from './source-affectation'

/**
 * L'employeuse courante d'une personne : celle de son affectation active
 * prioritaire, accompagnée de la période d'emploi que le contrat permet — ou
 * non — d'établir.
 */
export type EmployeuseActuelle = {
  readonly employeuse: Employeuse
  readonly source: SourceAffectation
  readonly periode: PeriodeEmploi
}

/** Au plus un contrat par employeuse (invariant du transfer, cf. `Contrat`). */
const periodePour = (
  contrats: readonly Contrat[],
  employeuse: Employeuse,
): PeriodeEmploi =>
  contrats.find((contrat) => contrat.employeuseId === employeuse.id)
    ?.periode ?? { _tag: 'inconnue' }

export const employeuseActuelle = (
  affectations: readonly Affectation[],
  contrats: readonly Contrat[],
): EmployeuseActuelle | null => {
  const affectation = affectationActuelle(affectations)
  if (!affectation) return null

  return {
    employeuse: affectation.employeuse,
    source: affectation.source,
    periode: periodePour(contrats, affectation.employeuse),
  }
}
