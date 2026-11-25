import { type Contrat, contratDeLEmployeuse } from '../affectation/contrat'
import type { PeriodeEmploi } from '../affectation/periode-emploi'
import type { SourceAffectation } from '../affectation/source-affectation'
import type { Employeuse } from '../employeuse'

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

export type AffectationActuelle = {
  readonly employeuse: Employeuse
  readonly source: SourceAffectation
}

export const employeuseActuelle = (
  affectation: AffectationActuelle | null,
  contrats: readonly Contrat[],
): EmployeuseActuelle | null =>
  affectation === null
    ? null
    : {
        employeuse: affectation.employeuse,
        source: affectation.source,
        periode: periodePour(contrats, affectation.employeuse),
      }
