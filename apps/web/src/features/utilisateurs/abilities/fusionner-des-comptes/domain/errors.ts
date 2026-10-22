export type FusionSurLeMemeCompte = { readonly _tag: 'FusionSurLeMemeCompte' }
export const FusionSurLeMemeCompte = (): FusionSurLeMemeCompte => ({
  _tag: 'FusionSurLeMemeCompte',
})

export type SourceIntrouvable = { readonly _tag: 'SourceIntrouvable' }
export const SourceIntrouvable = (): SourceIntrouvable => ({
  _tag: 'SourceIntrouvable',
})

export type CibleIntrouvable = { readonly _tag: 'CibleIntrouvable' }
export const CibleIntrouvable = (): CibleIntrouvable => ({
  _tag: 'CibleIntrouvable',
})

export type CibleSupprimee = { readonly _tag: 'CibleSupprimee' }
export const CibleSupprimee = (): CibleSupprimee => ({
  _tag: 'CibleSupprimee',
})

export type RoleProtege = { readonly _tag: 'RoleProtege' }
export const RoleProtege = (): RoleProtege => ({ _tag: 'RoleProtege' })

export type FusionnerError =
  | FusionSurLeMemeCompte
  | SourceIntrouvable
  | CibleIntrouvable
  | CibleSupprimee
  | RoleProtege
