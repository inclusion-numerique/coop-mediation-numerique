import type { AuteurId } from '@app/web/features/utilisateurs/domain'
import type { RetentionPolicy } from './retention-policy'

/**
 * Qui demande l'effacement. Trois chemins, une seule étape.
 *
 * Le système ne demande jamais dans l'absolu : il agit au titre d'une politique
 * de rétention, que la branche porte. C'est elle qui dit ensuite quel motif sera
 * journalisé.
 */
export type AuteurSuppression =
  | { readonly _tag: 'titulaire' }
  | { readonly _tag: 'administrateur'; readonly administrateurId: AuteurId }
  | { readonly _tag: 'systeme'; readonly policy: RetentionPolicy }
