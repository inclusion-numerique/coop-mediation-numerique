import type { Employeuse } from '../../../domain/employeuse'

export type PersonneEmployee = {
  readonly utilisateurId: string
  readonly prenom: string | null
  readonly nom: string | null
  readonly nomComplet: string | null
  readonly courriel: string
}

export type EmployeuseConsultee = {
  readonly employeuse: Employeuse
  readonly personnesEmployees: PersonneEmployee[]
}
