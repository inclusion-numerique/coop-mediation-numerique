import type { Employeuse } from '../employeuse'
import type { SourceAffectation } from './source-affectation'

export type Affectation = {
  readonly employeuse: Employeuse
  readonly source: SourceAffectation
  readonly active: boolean
  readonly depuis: Date | null
}
