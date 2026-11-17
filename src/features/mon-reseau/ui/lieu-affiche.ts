import type { LieuEnListe } from '@app/web/features/lieux-activite'

export type LieuAffiche = LieuEnListe

export type LieuxTrouves = {
  readonly lieux: readonly LieuAffiche[]
  readonly totalCount: number
  readonly totalPages: number
  readonly page: number
  readonly pageSize: number
}
