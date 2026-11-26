import type { Employeuse } from '../../../domain/employeuse'

export type EmployeuseListee = {
  readonly employeuse: Employeuse
  readonly personnesEmployees: number
}

export type ColonneDesEmployeuses =
  | 'nom'
  | 'emplois'
  | 'creation'
  | 'modification'
