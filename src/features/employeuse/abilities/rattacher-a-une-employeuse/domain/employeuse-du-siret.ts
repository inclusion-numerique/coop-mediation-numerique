import type { EmployeuseId } from '../../../domain/employeuse-id'

export type EmployeuseDuSiret = {
  readonly id: EmployeuseId
  readonly denominationAntenne: string | null
  readonly denominationSirene: string | null
}

const memeDenomination = (a: string | null, b: string | null): boolean =>
  a !== null && b !== null && a.trim().toLowerCase() === b.trim().toLowerCase()

export const employeuseExistante = (
  employeuses: readonly EmployeuseDuSiret[],
  denomination: string | null,
): EmployeuseId | null =>
  (
    employeuses.find(({ denominationAntenne }) =>
      memeDenomination(denominationAntenne, denomination),
    ) ??
    employeuses.find(({ denominationSirene }) =>
      memeDenomination(denominationSirene, denomination),
    )
  )?.id ?? null
