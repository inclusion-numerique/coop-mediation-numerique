import type { Lieu } from '../../../domain/lieu'
import type { LieuACreer } from './lieu-demande'

export type CreationDemandee = {
  readonly demande: LieuACreer
  readonly carto: Lieu | null
}
