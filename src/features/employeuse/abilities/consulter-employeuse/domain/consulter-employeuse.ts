import type { Employeuse } from '../../../domain/employeuse'
import type { EmployeuseId } from '../../../domain/employeuse-id'

/**
 * Personne employée, telle que l'administration a besoin de la reconnaître :
 * de quoi la nommer et la joindre. Le rattachement vient d'une affectation
 * active, et la personne n'est visible que si elle correspond à un compte coop
 * — l'Entrepôt en connaît d'autres, qui ne nous regardent pas.
 */
export type PersonneEmployee = {
  readonly utilisateurId: string
  readonly prenom: string | null
  readonly nom: string | null
  readonly nomComplet: string | null
  readonly courriel: string
}

/**
 * Fiche d'une employeuse en administration : son identité légale, son référent,
 * et qui elle emploie aujourd'hui.
 */
export type EmployeuseConsultee = {
  readonly employeuse: Employeuse
  readonly personnesEmployees: PersonneEmployee[]
}

/** `null` quand l'identifiant ne désigne aucune employeuse vivante. */
export type ConsulterEmployeuse = (input: {
  employeuseId: EmployeuseId
}) => Promise<EmployeuseConsultee | null>
