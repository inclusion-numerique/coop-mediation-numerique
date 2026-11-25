import type { Paginated } from '@arckit/resultset'
import type { LigneUtilisateur } from '@/features/utilisateurs/domain'

export type UtilisateursTrouves = Paginated<LigneUtilisateur> & {
  readonly totalCount: number
}
