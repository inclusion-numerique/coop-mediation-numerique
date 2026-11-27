export type VisiteurIntrouvable = { readonly _tag: 'VisiteurIntrouvable' }

export const VisiteurIntrouvable = (): VisiteurIntrouvable => ({
  _tag: 'VisiteurIntrouvable',
})

export type SansProfilDAccueil = { readonly _tag: 'SansProfilDAccueil' }

export const SansProfilDAccueil = (): SansProfilDAccueil => ({
  _tag: 'SansProfilDAccueil',
})

export type EchecDeConsulterLAccueil = VisiteurIntrouvable | SansProfilDAccueil
