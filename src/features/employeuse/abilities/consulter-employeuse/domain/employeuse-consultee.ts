import type { Employeuse } from '../../../domain/employeuse'
import type { UtilisateurId } from '../../../domain/utilisateur-id'
import type { CourrielDeLaPersonne } from './courriel-de-la-personne'
import type { NomDeLaPersonne } from './nom-de-la-personne'

export type PersonneEmployee = {
  readonly utilisateurId: UtilisateurId
  readonly prenom: NomDeLaPersonne | null
  readonly nom: NomDeLaPersonne | null
  readonly nomComplet: NomDeLaPersonne | null
  readonly courriel: CourrielDeLaPersonne | null
}

export type EmployeuseConsultee = {
  readonly employeuse: Employeuse
  readonly personnesEmployees: readonly PersonneEmployee[]
}
