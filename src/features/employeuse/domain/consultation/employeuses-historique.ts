import type { Affectation } from '../affectation/affectation'
import { type Contrat, contratDeLEmployeuse } from '../affectation/contrat'
import type { PeriodeEmploi } from '../affectation/periode-emploi'
import type { Employeuse } from '../employeuse'

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
