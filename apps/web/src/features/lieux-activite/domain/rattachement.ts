import type { LieuId } from './lieu-id'
import type { MediateurId } from './mediateur-id'
import type { RattachementId } from './rattachement-id'
import {
  ModifieParUtilisateur,
  type TracabiliteRattachement,
} from './tracabilite'
import type { UserId } from './user-id'

type Base = {
  readonly id: RattachementId
  readonly lieuId: LieuId
  readonly mediateurId: MediateurId
  readonly debut: Date
  readonly tracabilite: TracabiliteRattachement
}

export type RattachementEnCours = Base & { readonly _tag: 'EnCours' }

export type RattachementTermine = Base & {
  readonly _tag: 'Termine'
  readonly fin: Date
}

export type RattachementSupprime = Base & {
  readonly _tag: 'Supprime'
  readonly suppression: Date
  readonly supprimePar: UserId | null
  readonly fin: Date | null
}

export type Rattachement =
  | RattachementEnCours
  | RattachementTermine
  | RattachementSupprime

export const estEnCours = (
  rattachement: Rattachement,
): rattachement is RattachementEnCours => rattachement._tag === 'EnCours'

export const terminer = (
  rattachement: RattachementEnCours,
  fin: Date,
  par: UserId,
): RattachementTermine => ({
  ...rattachement,
  _tag: 'Termine',
  fin,
  tracabilite: {
    ...rattachement.tracabilite,
    derniereModification: ModifieParUtilisateur(fin, par),
  },
})
