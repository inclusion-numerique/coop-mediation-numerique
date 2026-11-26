import type { LieuId } from '../../../domain/identifiants/lieu-id'

export type FusionDeLieux = {
  readonly source: LieuId
  readonly cible: LieuId
  readonly fusionneLe: Date
}
