import type {
  CibleIntrouvable,
  RoleProtege,
  SourceIntrouvable,
} from '@/features/utilisateurs/domain'

export type FusionSurLeMemeCompte = { readonly _tag: 'FusionSurLeMemeCompte' }
export const FusionSurLeMemeCompte = (): FusionSurLeMemeCompte => ({
  _tag: 'FusionSurLeMemeCompte',
})

export type CibleSupprimee = { readonly _tag: 'CibleSupprimee' }
export const CibleSupprimee = (): CibleSupprimee => ({
  _tag: 'CibleSupprimee',
})

export type EchecDeFusionnerDesComptes =
  | FusionSurLeMemeCompte
  | SourceIntrouvable
  | CibleIntrouvable
  | CibleSupprimee
  | RoleProtege
