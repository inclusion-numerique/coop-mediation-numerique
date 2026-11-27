import type { EmployeuseId } from '../../../domain/employeuse-id'
import type { IdentiteEmployeuse } from '../../../domain/identite-employeuse'
import type { UtilisateurId } from '../../../domain/utilisateur-id'
import type { MotifSansRattachement } from './motif-sans-rattachement'

type EmployeuseRattachee = {
  readonly _tag: 'Rattachee'
  readonly userId: UtilisateurId
  readonly employeuseId: EmployeuseId
  readonly employeuseCreee: IdentiteEmployeuse | null
}

type SansRattachement = {
  readonly _tag: 'SansRattachement'
  readonly motif: MotifSansRattachement
}

export type Rattachement = EmployeuseRattachee | SansRattachement
