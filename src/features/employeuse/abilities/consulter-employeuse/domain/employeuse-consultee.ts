import type { Employeuse } from '../../../domain/employeuse'
import type { UtilisateurId } from '../../../domain/utilisateur-id'

export type PersonneEmployee = {
  readonly utilisateurId: UtilisateurId
  readonly prenom: string | null
  readonly nom: string | null
  readonly nomComplet: string | null
  readonly courriel: string
}

export type EmployeuseConsultee = {
  readonly employeuse: Employeuse
  readonly personnesEmployees: readonly PersonneEmployee[]
}
