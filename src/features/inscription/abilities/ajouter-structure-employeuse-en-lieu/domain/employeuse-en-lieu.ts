import type { LieuDecrit, TraceDeLEmployeuse } from './ports'

export type EmployeuseEnLieu<Destination> =
  | {
      readonly _tag: 'RattacheeCommeLieu'
      readonly lieu: LieuDecrit
      readonly trace: TraceDeLEmployeuse
      readonly destination: Destination
    }
  | {
      readonly _tag: 'DetacheeDesLieux'
      readonly lieu: LieuDecrit
      readonly trace: TraceDeLEmployeuse
      readonly lieuDetache: string | null
    }
