import type { ChampsPartageables, LieuAFusionner } from './lieu-a-fusionner'

export type FusionApercue = {
  readonly mergeSource: LieuAFusionner
  readonly mergeTarget: LieuAFusionner
  readonly mergeCommon: ChampsPartageables
}
