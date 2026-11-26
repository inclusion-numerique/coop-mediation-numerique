import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { FusionDeLieux } from './fusion-de-lieux'

export type LieuxExistants = (
  lieux: readonly LieuId[],
) => Promise<readonly LieuId[]>

export type FusionnerLesLieux = (
  fusion: FusionDeLieux,
) => Promise<{ readonly fusionne: boolean }>

export type FusionnerDesLieuxPorts = {
  readonly lieuxExistants: LieuxExistants
  readonly fusionner: FusionnerLesLieux
}
