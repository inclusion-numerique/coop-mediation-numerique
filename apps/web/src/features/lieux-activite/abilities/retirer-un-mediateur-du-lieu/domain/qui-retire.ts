import type { MediateurId } from '../../../domain/mediateur-id'

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

export const doitEtrePrevenu = (auteur: QuiRetire): boolean =>
  auteur._tag !== 'LeMediateurLuiMeme'
