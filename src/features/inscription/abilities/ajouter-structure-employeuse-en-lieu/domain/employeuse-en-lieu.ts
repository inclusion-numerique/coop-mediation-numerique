import type { LieuDecrit, TraceDeLEmployeuse } from './ports'

export type EmployeuseEnLieu = {
  readonly _tag: 'RattacheeCommeLieu' | 'DetacheeDesLieux'
  readonly lieu: LieuDecrit
  readonly trace: TraceDeLEmployeuse
}
