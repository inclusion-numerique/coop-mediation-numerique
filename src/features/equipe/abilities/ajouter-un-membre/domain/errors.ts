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
