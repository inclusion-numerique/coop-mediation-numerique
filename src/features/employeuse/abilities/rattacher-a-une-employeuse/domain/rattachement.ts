import type { EmployeuseId } from '../../../domain/employeuse-id'
import type { IdentiteEmployeuse } from '../../../domain/identite-employeuse'

export type EmployeuseRattachee = {
  readonly _tag: 'Rattachee'
  readonly userId: string
  readonly employeuseId: EmployeuseId
  readonly employeuseCreee: IdentiteEmployeuse | null
}

export type SansRattachement = {
  readonly _tag: 'SansRattachement'
  readonly motif: 'SiretAbsent' | 'ConseillerNumeriqueEnPoste'
}

export type Rattachement = EmployeuseRattachee | SansRattachement
