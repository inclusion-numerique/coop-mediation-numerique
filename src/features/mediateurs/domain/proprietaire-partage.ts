import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'
import type { PerimetrePartage } from './perimetre-partage'

export type ProprietairePartage =
  | { readonly _tag: 'Mediateur'; readonly mediateurId: MediateurId }
  | { readonly _tag: 'Coordinateur'; readonly coordinateurId: CoordinateurId }

export type Rattachements = {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
}

const enTantQueMediateur = (
  mediateurId: MediateurId | null,
): ProprietairePartage[] =>
  mediateurId === null ? [] : [{ _tag: 'Mediateur', mediateurId }]

const enTantQueCoordinateur = (
  coordinateurId: CoordinateurId | null,
): ProprietairePartage[] =>
  coordinateurId === null ? [] : [{ _tag: 'Coordinateur', coordinateurId }]

export const proprietairesPossibles = ({
  mediateurId,
  coordinateurId,
}: Rattachements): readonly ProprietairePartage[] => [
  ...enTantQueMediateur(mediateurId),
  ...enTantQueCoordinateur(coordinateurId),
]

export const proprietaireDuPerimetre = (
  rattachements: Rattachements,
  perimetre: PerimetrePartage,
): ProprietairePartage | null =>
  proprietairesPossibles(rattachements).find(
    (proprietaire) => proprietaire._tag === perimetre,
  ) ?? null
