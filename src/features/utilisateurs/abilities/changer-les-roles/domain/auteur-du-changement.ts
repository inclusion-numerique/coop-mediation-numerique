import type { AuteurId } from '@/features/utilisateurs/domain'

export type AuteurDuChangement =
  | { readonly _tag: 'administrateur'; readonly administrateurId: AuteurId }
  | { readonly _tag: 'systeme' }
