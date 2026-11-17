import type { LigneUtilisateur } from '@/features/utilisateurs/domain'

export type UtilisateursTrouves = {
  readonly totalCount: number
  readonly matchesCount: number
  readonly totalPages: number
  readonly utilisateurs: readonly LigneUtilisateur[]
}
