import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { LieuAFusionner } from './lieu-a-fusionner'

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
