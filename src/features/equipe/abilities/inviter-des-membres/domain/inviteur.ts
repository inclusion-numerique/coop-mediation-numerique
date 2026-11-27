import type { CoordinateurId } from '../../../domain'

export type Inviteur =
  | { readonly type: 'Coordinateur'; readonly coordinateurId: CoordinateurId }
  | { readonly type: 'NonCoordinateur' }
