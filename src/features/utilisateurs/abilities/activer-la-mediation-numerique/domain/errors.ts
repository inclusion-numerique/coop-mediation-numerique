import type { UtilisateurIntrouvable } from '@/features/utilisateurs/domain'

export type NonCoordinateur = { readonly _tag: 'NonCoordinateur' }

export const NonCoordinateur = (): NonCoordinateur => ({
  _tag: 'NonCoordinateur',
})

export type EchecDActiverLaMediationNumerique =
  | UtilisateurIntrouvable
  | NonCoordinateur
