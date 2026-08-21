import { type Affectation, affectationActuelle } from './affectation'
import type { Contrat } from './contrat'
import type { Employeuse } from './employeuse'
import { couvre, debutEmploi } from './periode-emploi'

/**
 * Le contrat qui couvre la date, quand plusieurs se chevauchent : le plus
 * récemment commencé.
 *
 * 63 personnes de production portent des contrats simultanés chez des
 * structures DIFFÉRENTES. Prendre le premier venu laissait le choix à l'ordre
 * de la requête, que rien ne fixe : deux saisies du même CRA pouvaient le
 * rattacher à deux employeuses. L'arbitrage reprend celui des affectations —
 * à autorité égale, le rattachement le plus récent l'emporte.
 *
 * Une période qui couvre une date a nécessairement un début (voir `couvre`),
 * d'où le repli à 0 qui ne sert qu'à satisfaire le type.
 */
const contratCouvrant = (
  contrats: readonly Contrat[],
  date: Date,
): Contrat | null =>
  contrats
    .filter((contrat) => couvre(contrat.periode, date))
    .toSorted(
      (a, b) =>
        (debutEmploi(b.periode)?.getTime() ?? 0) -
        (debutEmploi(a.periode)?.getTime() ?? 0),
    )
    .at(0) ?? null

/**
 * L'employeuse d'une personne à une date donnée.
 *
 * Le contrat qui couvre la date fait foi — c'est ce qui permet de rattacher une
 * activité rétro-datée à l'employeuse de l'époque, y compris si la personne a
 * changé d'employeur depuis. À défaut de contrat couvrant (les ~53 % de
 * personnes sans contrat, ou un trou entre deux contrats), on retombe sur
 * l'employeuse courante : c'est la meilleure information disponible, et elle est
 * juste pour l'écrasante majorité, qui n'a jamais changé d'employeuse.
 *
 * Le contrat passe AVANT l'affectation, et c'est ce qui rend le formulaire de
 * rattachement inoffensif pour le passé : déclarer une employeuse aujourd'hui
 * ne sert que les dates qu'aucun contrat ne couvre.
 */
export const employeuseALaDate = (
  affectations: readonly Affectation[],
  contrats: readonly Contrat[],
  date: Date,
): Employeuse | null =>
  contratCouvrant(contrats, date)?.employeuse ??
  affectationActuelle(affectations)?.employeuse ??
  null
