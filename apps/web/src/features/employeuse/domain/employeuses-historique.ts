import type { Affectation } from './affectation'
import { type Contrat, contratDeLEmployeuse } from './contrat'
import type { Employeuse } from './employeuse'
import type { PeriodeEmploi } from './periode-emploi'

/**
 * Une employeuse dans le parcours d'une personne : toutes celles auxquelles elle
 * est ou a été affectée, quelle que soit la source.
 *
 * `affectationActive` remplace l'ancien soft-delete coop : une affectation
 * désactivée est un emploi terminé, pas une ligne supprimée. La période reste
 * best-effort — elle vient du contrat, absent pour la moitié des affectations
 * déclarées.
 */
export type EmployeuseHistorique = {
  readonly employeuse: Employeuse
  readonly affectationActive: boolean
  readonly periode: PeriodeEmploi
  readonly depuis: Date | null
}

const laPlusAncienne = (dates: readonly (Date | null)[]): Date | null =>
  dates
    .filter((date): date is Date => date !== null)
    .toSorted((a, b) => a.getTime() - b.getTime())[0] ?? null

/**
 * Une entrée par employeuse, dans l'ordre de première rencontre.
 *
 * La déduplication n'est pas cosmétique : une même personne peut être affectée
 * à une structure deux fois — une par le dispositif, une par le déclaratif — et
 * l'admin doit y voir un seul employeur. L'emploi est en cours dès qu'une de ces
 * affectations l'est, et sa date d'entrée est la plus ancienne des deux.
 */
export const employeusesHistorique = (
  affectations: readonly Affectation[],
  contrats: readonly Contrat[],
): EmployeuseHistorique[] => {
  const employeuses = [
    ...new Map(
      affectations.map((affectation) => [
        affectation.employeuse.id,
        affectation.employeuse,
      ]),
    ).values(),
  ]

  return employeuses.map((employeuse) => {
    const siennes = affectations.filter(
      (affectation) => affectation.employeuse.id === employeuse.id,
    )

    return {
      employeuse,
      affectationActive: siennes.some((affectation) => affectation.active),
      periode: contratDeLEmployeuse(contrats, employeuse)?.periode ?? {
        _tag: 'inconnue',
      },
      depuis: laPlusAncienne(siennes.map((affectation) => affectation.depuis)),
    }
  })
}
