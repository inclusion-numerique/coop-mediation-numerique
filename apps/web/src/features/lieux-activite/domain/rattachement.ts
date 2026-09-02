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

/**
 * L'exercice d'un médiateur dans un lieu. `debut`, `fin` et `suppression`
 * encodent un seul état, et les trois variantes existent en production :
 * retirer un médiateur d'un lieu date la fin sans supprimer, tandis que délier
 * une structure employeuse écrit les deux.
 *
 * L'effacement d'un compte, lui, fait disparaître la ligne : ce n'est pas une
 * variante, c'est l'absence.
 */
export type RattachementEnCours = Base & { readonly _tag: 'EnCours' }

export type RattachementTermine = Base & {
  readonly _tag: 'Termine'
  readonly fin: Date
}

export type RattachementSupprime = Base & {
  readonly _tag: 'Supprime'
  readonly suppression: Date
  readonly supprimePar: UserId | null
  /**
   * La base ne connaît aucun rattachement supprimé sans date de fin, mais rien
   * ne l'interdit : l'absence est modélisée plutôt que fabriquée à partir de la
   * date de suppression.
   */
  readonly fin: Date | null
}

export type Rattachement =
  | RattachementEnCours
  | RattachementTermine
  | RattachementSupprime

export const estEnCours = (
  rattachement: Rattachement,
): rattachement is RattachementEnCours => rattachement._tag === 'EnCours'

/** Dater la fin de l'exercice, sans effacer la trace du passage. */
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
