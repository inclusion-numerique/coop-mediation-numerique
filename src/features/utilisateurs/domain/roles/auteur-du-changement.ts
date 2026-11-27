import type { AuteurId } from '../identifiants/auteur-id'

export type AuteurDuChangement =
  | { readonly _tag: 'administrateur'; readonly administrateurId: AuteurId }
  | { readonly _tag: 'systeme' }
