import type { MediateurId } from '../../../domain/mediateur-id'

/**
 * Qui peut retirer un médiateur d'un lieu.
 *
 * Contrairement à la correction de la fiche, que l'annuaire laisse ouverte à
 * tous, le retrait touche au rattachement de quelqu'un d'autre : la règle du
 * routeur tRPC est conservée telle quelle. Un médiateur se retire lui-même
 * librement ; retirer autrui suppose de coordonner ou d'administrer.
 */
export type QuiRetire =
  | { readonly _tag: 'LeMediateurLuiMeme' }
  | { readonly _tag: 'UnCoordinateur' }
  | { readonly _tag: 'UnAdministrateur' }
  | { readonly _tag: 'QuelquUnDautre' }

export const quiRetire = ({
  mediateurRetire,
  mediateurDeLAuteur,
  estAdministrateur,
  estCoordinateur,
}: {
  mediateurRetire: MediateurId
  mediateurDeLAuteur: MediateurId | null
  estAdministrateur: boolean
  estCoordinateur: boolean
}): QuiRetire => {
  if (mediateurDeLAuteur === mediateurRetire)
    return { _tag: 'LeMediateurLuiMeme' }
  if (estAdministrateur) return { _tag: 'UnAdministrateur' }
  if (estCoordinateur) return { _tag: 'UnCoordinateur' }

  return { _tag: 'QuelquUnDautre' }
}

export const peutRetirer = (auteur: QuiRetire): boolean =>
  auteur._tag !== 'QuelquUnDautre'

/**
 * On ne prévient pas quelqu'un de son propre départ : l'e-mail n'a de sens que
 * si le retrait vient d'un tiers.
 */
export const doitEtrePrevenu = (auteur: QuiRetire): boolean =>
  auteur._tag !== 'LeMediateurLuiMeme'
