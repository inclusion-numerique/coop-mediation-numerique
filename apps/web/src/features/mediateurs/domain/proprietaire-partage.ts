import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'

export type ProprietairePartage =
  | { readonly _tag: 'Mediateur'; readonly mediateurId: MediateurId }
  | { readonly _tag: 'Coordinateur'; readonly coordinateurId: CoordinateurId }

export type Rattachements = {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
}

export const proprietairePartageDe = ({
  mediateurId,
  coordinateurId,
}: Rattachements): ProprietairePartage | null => {
  if (mediateurId !== null) return { _tag: 'Mediateur', mediateurId }
  if (coordinateurId !== null) return { _tag: 'Coordinateur', coordinateurId }
  return null
}
