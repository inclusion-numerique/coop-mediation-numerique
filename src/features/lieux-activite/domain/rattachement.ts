import type { LieuId } from './lieu-id'
import type { MediateurId } from './mediateur-id'
import type { RattachementId } from './rattachement-id'
import { type TracabiliteRattachement } from './tracabilite'
import type { UserId } from './user-id'

type Base = {
  readonly id: RattachementId
  readonly lieuId: LieuId
  readonly mediateurId: MediateurId
  readonly debut: Date
  readonly tracabilite: TracabiliteRattachement
}

type RattachementEnCours = Base & { readonly _tag: 'EnCours' }

type RattachementTermine = Base & {
  readonly _tag: 'Termine'
  readonly fin: Date
}

type RattachementSupprime = Base & {
  readonly _tag: 'Supprime'
  readonly suppression: Date
  readonly supprimePar: UserId | null
  readonly fin: Date | null
}

export type Rattachement =
  | RattachementEnCours
  | RattachementTermine
  | RattachementSupprime
