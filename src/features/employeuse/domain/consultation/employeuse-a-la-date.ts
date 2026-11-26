import type { Contrat } from '../affectation/contrat'
import { couvre, debutEmploi } from '../affectation/periode-emploi'
import type { Employeuse } from '../employeuse'

/**
 * Le contrat qui couvre la date, quand plusieurs se chevauchent : le plus
 * récemment commencé.
 *
 * 63 personnes de production portent des contrats simultanés chez des
 * structures DIFFÉRENTES. Prendre le premier venu laissait le choix à l'ordre
 * de la requête, que rien ne fixe : deux saisies du même CRA pouvaient le
 * rattacher à deux employeuses. L'arbitrage reprend celui des affectations —
 * à autorité égale, le rattachement le plus récent l'emporte.
 */
const contratCouvrant = (
  contrats: readonly Contrat[],
  date: Date,
): Contrat | null =>
  contrats
    .flatMap((contrat) => {
      const debut = debutEmploi(contrat.periode)
      return debut !== null && couvre(contrat.periode, date)
        ? [{ contrat, debut }]
        : []
    })
    .toSorted((a, b) => b.debut.getTime() - a.debut.getTime())
    .at(0)?.contrat ?? null

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
  actuelle: Employeuse | null,
  contrats: readonly Contrat[],
  date: Date,
): Employeuse | null => contratCouvrant(contrats, date)?.employeuse ?? actuelle
