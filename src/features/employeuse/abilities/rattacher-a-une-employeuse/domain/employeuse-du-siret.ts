import type { DenominationEmployeuse } from '../../../domain/denomination-employeuse'
import type { EmployeuseId } from '../../../domain/employeuse-id'

export type EmployeuseDuSiret = {
  readonly id: EmployeuseId
  readonly denominationAntenne: DenominationEmployeuse | null
  readonly denominationSirene: DenominationEmployeuse | null
}

const memeDenomination = (
  a: DenominationEmployeuse | null,
  b: DenominationEmployeuse | null,
): boolean =>
  a !== null && b !== null && a.trim().toLowerCase() === b.trim().toLowerCase()

export const employeuseExistante = (
  employeuses: readonly EmployeuseDuSiret[],
  denomination: DenominationEmployeuse | null,
): EmployeuseId | null =>
  (
    employeuses.find(({ denominationAntenne }) =>
      memeDenomination(denominationAntenne, denomination),
    ) ??
    employeuses.find(({ denominationSirene }) =>
      memeDenomination(denominationSirene, denomination),
    )
  )?.id ?? null
