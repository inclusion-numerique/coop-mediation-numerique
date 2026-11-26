import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { FicheFusionnable } from './fiche-fusionnable'
import type { FusionDeLieux } from './fusion-de-lieux'
import type { LieuAFusionner } from './lieu-a-fusionner'

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

export type LieuxAApercevoir = (lieux: {
  readonly source: LieuId
  readonly cible: LieuId
}) => Promise<{
  readonly source: LieuAFusionner | null
  readonly cible: LieuAFusionner | null
}>

export type ApercevoirLaFusionPorts = {
  readonly lieuxAApercevoir: LieuxAApercevoir
}
