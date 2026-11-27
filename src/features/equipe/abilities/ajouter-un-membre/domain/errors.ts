import type { CoordinateurIntrouvable, DejaMembre } from '../../../domain'

export type UtilisateurIntrouvable = { readonly _tag: 'UtilisateurIntrouvable' }

export const UtilisateurIntrouvable = (): UtilisateurIntrouvable => ({
  _tag: 'UtilisateurIntrouvable',
})

export type UtilisateurNonMediateur = {
  readonly _tag: 'UtilisateurNonMediateur'
}

export const UtilisateurNonMediateur = (): UtilisateurNonMediateur => ({
  _tag: 'UtilisateurNonMediateur',
})

export type EchecDeAjouterUnMembre =
  | UtilisateurIntrouvable
  | UtilisateurNonMediateur
  | CoordinateurIntrouvable
  | DejaMembre
