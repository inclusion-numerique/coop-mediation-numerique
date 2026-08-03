import { type Affectation, affectationActuelle } from './affectation'
import { type Contrat, contratDeLEmployeuse } from './contrat'
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

/** Le contrat le plus récent chez cette employeuse ; à défaut, période inconnue. */
const periodePour = (
  contrats: readonly Contrat[],
  employeuse: Employeuse,
): PeriodeEmploi =>
  contratDeLEmployeuse(contrats, employeuse)?.periode ?? { _tag: 'inconnue' }

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
