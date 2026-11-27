import type { LieuId } from '@/features/inscription/domain'
import type { LieuDecrit, LieuDecritGeocode, TraceDeLEmployeuse } from './ports'

export type EmployeuseEnLieu<Destination> =
  | {
      readonly _tag: 'RattacheeCommeLieu'
      readonly lieu: LieuDecritGeocode
      readonly trace: TraceDeLEmployeuse
      readonly destination: Destination
    }
  | {
      readonly _tag: 'DetacheeDesLieux'
      readonly lieu: LieuDecrit | null
      readonly trace: TraceDeLEmployeuse
      readonly lieuDetache: LieuId | null
    }
