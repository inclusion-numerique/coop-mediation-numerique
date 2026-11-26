import type { Employeuse } from '../employeuse'
import { debutEmploi, type PeriodeEmploi } from './periode-emploi'

export type Contrat = {
  readonly employeuse: Employeuse
  readonly periode: PeriodeEmploi
}

const contratLePlusRecent = <T>(
  contrats: readonly T[],
  debutDe: (contrat: T) => Date | null,
): T | null =>
  contrats.toSorted(
    (a, b) => (debutDe(b)?.getTime() ?? 0) - (debutDe(a)?.getTime() ?? 0),
  )[0] ?? null

export const contratDeLEmployeuse = (
  contrats: readonly Contrat[],
  employeuse: Employeuse,
): Contrat | null =>
  contratLePlusRecent(
    contrats.filter((contrat) => contrat.employeuse.id === employeuse.id),
    (contrat) => debutEmploi(contrat.periode),
  )
