import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { FicheFusionnable } from './fiche-fusionnable'

export type FusionDeLieux = {
  readonly source: LieuId
  readonly cible: LieuId
  readonly fusionneLe: Date
  readonly fiche: FicheFusionnable
}
