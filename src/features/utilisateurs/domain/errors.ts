import type { UtilisateurId } from './utilisateur-id'

export type UtilisateurIntrouvable = {
  readonly _tag: 'UtilisateurIntrouvable'
  readonly utilisateurId: string
}

export const UtilisateurIntrouvable = (
  utilisateurId: string,
): UtilisateurIntrouvable => ({ _tag: 'UtilisateurIntrouvable', utilisateurId })

export type CompteSupprime = {
  readonly _tag: 'CompteSupprime'
  readonly utilisateurId: UtilisateurId
}

export const CompteSupprime = (
  utilisateurId: UtilisateurId,
): CompteSupprime => ({
  _tag: 'CompteSupprime',
  utilisateurId,
})
