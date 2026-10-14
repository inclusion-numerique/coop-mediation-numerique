import type { CoordinateurId } from './coordinateur-id'

export type Gestionnaire =
  | { readonly type: 'Administrateur' }
  | { readonly type: 'Coordinateur'; readonly coordinateurId: CoordinateurId }
  | { readonly type: 'Autre' }

export const peutGererLEquipe =
  (gestionnaire: Gestionnaire) =>
  (coordinateurId: CoordinateurId): boolean =>
    gestionnaire.type === 'Administrateur' ||
    (gestionnaire.type === 'Coordinateur' &&
      gestionnaire.coordinateurId === coordinateurId)
