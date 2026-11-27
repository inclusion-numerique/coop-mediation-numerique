import type { Lieu } from '../lieu'
import type { LieuACreer } from './lieu-demande'

export type CreationDemandee = {
  readonly demande: LieuACreer
  readonly carto: Lieu | null
}
