import type { ActionNonAutorisee } from '../../../domain'

export type ToujoursMembre = { readonly _tag: 'ToujoursMembre' }

export const ToujoursMembre = (): ToujoursMembre => ({ _tag: 'ToujoursMembre' })

export type PasAncienMembre = { readonly _tag: 'PasAncienMembre' }

export const PasAncienMembre = (): PasAncienMembre => ({
  _tag: 'PasAncienMembre',
})

export type EchecDeSupprimerUnAncienMembre =
  | ActionNonAutorisee
  | ToujoursMembre
  | PasAncienMembre
