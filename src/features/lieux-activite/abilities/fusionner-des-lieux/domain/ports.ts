import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { FicheFusionnable } from './fiche-fusionnable'
import type { FusionDeLieux } from './fusion-de-lieux'

export type FichesAFusionner = (
  lieux: readonly LieuId[],
) => Promise<readonly FicheFusionnable[]>

export type FusionnerLesLieux = (
  fusion: FusionDeLieux,
) => Promise<{ readonly fusionne: boolean }>

export type FusionnerDesLieuxPorts = {
  readonly fichesAFusionner: FichesAFusionner
  readonly fusionner: FusionnerLesLieux
}
