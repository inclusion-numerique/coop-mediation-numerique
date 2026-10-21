import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'

export type Rattachements<M, C> =
  | { readonly _tag: 'aucun' }
  | { readonly _tag: 'mediateur'; readonly mediateur: M }
  | { readonly _tag: 'coordinateur'; readonly coordinateur: C }
  | {
      readonly _tag: 'mediateurEtCoordinateur'
      readonly mediateur: M
      readonly coordinateur: C
    }

export type RattachementsDuCompte = Rattachements<MediateurId, CoordinateurId>

export type IdentifiantsRattaches = {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
}

export const rattachements = <M, C>(
  mediateur: M | null,
  coordinateur: C | null,
): Rattachements<M, C> => {
  if (mediateur !== null && coordinateur !== null)
    return { _tag: 'mediateurEtCoordinateur', mediateur, coordinateur }
  if (mediateur !== null) return { _tag: 'mediateur', mediateur }
  if (coordinateur !== null) return { _tag: 'coordinateur', coordinateur }
  return { _tag: 'aucun' }
}

export const mediateurDe = <M, C>(rattache: Rattachements<M, C>): M | null =>
  rattache._tag === 'mediateur' || rattache._tag === 'mediateurEtCoordinateur'
    ? rattache.mediateur
    : null

export const coordinateurDe = <M, C>(
  rattache: Rattachements<M, C>,
): C | null =>
  rattache._tag === 'coordinateur' ||
  rattache._tag === 'mediateurEtCoordinateur'
    ? rattache.coordinateur
    : null

export const identifiantsDe = (
  rattache: RattachementsDuCompte,
): IdentifiantsRattaches => ({
  mediateurId: mediateurDe(rattache),
  coordinateurId: coordinateurDe(rattache),
})
