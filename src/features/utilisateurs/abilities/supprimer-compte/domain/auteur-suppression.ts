import type { AuteurId } from '@/features/utilisateurs/domain'
import type { RetentionPolicy } from './retention-policy'

export type AuteurSuppression =
  | { readonly _tag: 'titulaire' }
  | { readonly _tag: 'administrateur'; readonly administrateurId: AuteurId }
  | { readonly _tag: 'systeme'; readonly policy: RetentionPolicy }
