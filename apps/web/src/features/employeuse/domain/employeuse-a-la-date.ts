import { type Affectation, affectationActuelle } from './affectation'
import type { Contrat } from './contrat'
import type { Employeuse } from './employeuse'
import { couvre } from './periode-emploi'

/**
 * L'employeuse d'une personne à une date donnée.
 *
 * Le contrat qui couvre la date fait foi — c'est ce qui permet de rattacher une
 * activité rétro-datée à l'employeuse de l'époque, y compris si la personne a
 * changé d'employeur depuis. À défaut de contrat couvrant (les ~53 % de
 * personnes sans contrat, ou un trou entre deux contrats), on retombe sur
 * l'employeuse courante : c'est la meilleure information disponible, et elle est
 * juste pour l'écrasante majorité, qui n'a jamais changé d'employeuse.
 */
export const employeuseALaDate = (
  affectations: readonly Affectation[],
  contrats: readonly Contrat[],
  date: Date,
): Employeuse | null =>
  contrats.find((contrat) => couvre(contrat.periode, date))?.employeuse ??
  affectationActuelle(affectations)?.employeuse ??
  null
