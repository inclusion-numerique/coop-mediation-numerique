import type { LigneUtilisateur } from '@app/web/features/utilisateurs/domain'

export type UtilisateursTrouves = {
  readonly totalCount: number
  readonly matchesCount: number
  readonly totalPages: number
  readonly utilisateurs: readonly LigneUtilisateur[]
}
