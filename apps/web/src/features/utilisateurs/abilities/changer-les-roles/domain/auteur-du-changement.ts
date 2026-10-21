import type { AuteurId } from '@app/web/features/utilisateurs/domain'

export type AuteurDuChangement =
  | { readonly _tag: 'administrateur'; readonly administrateurId: AuteurId }
  | { readonly _tag: 'systeme' }
