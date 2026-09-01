import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'

/**
 * À qui appartient un tag.
 *
 * La table porte `mediateur_id` et `coordinateur_id`, tous deux nullables : deux
 * colonnes pour un seul état, qui rendent représentables « personne » et « les
 * deux à la fois ». L'union rétablit l'invariant — un tag a exactement un
 * détenteur — et rend la bascule de l'un à l'autre explicite plutôt que
 * dispersée dans un `updateMany`.
 */
export type ProprietaireTag =
  | { readonly _tag: 'mediateur'; readonly mediateurId: MediateurId }
  | { readonly _tag: 'coordinateur'; readonly coordinateurId: CoordinateurId }

export const detenuParMediateur = (
  mediateurId: MediateurId,
): ProprietaireTag => ({ _tag: 'mediateur', mediateurId })

export const detenuParCoordinateur = (
  coordinateurId: CoordinateurId,
): ProprietaireTag => ({ _tag: 'coordinateur', coordinateurId })
