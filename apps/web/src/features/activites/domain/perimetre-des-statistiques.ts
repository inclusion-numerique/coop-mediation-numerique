import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'

export type PerimetreDesStatistiques =
  | { readonly type: 'Mediateur'; readonly mediateur: MediateurId }
  | {
      readonly type: 'Equipe'
      readonly coordinateur: CoordinateurId
      readonly membres: readonly MediateurId[]
    }
  | { readonly type: 'National' }

export const PERIMETRE_NATIONAL: PerimetreDesStatistiques = { type: 'National' }

export const perimetreDuDemandeur = ({
  mediateur,
  coordinateur,
  equipe,
}: {
  readonly mediateur: MediateurId | null
  readonly coordinateur: CoordinateurId | null
  readonly equipe: readonly MediateurId[]
}): PerimetreDesStatistiques | null =>
  coordinateur !== null
    ? {
        type: 'Equipe',
        coordinateur,
        membres: [
          ...new Set([...(mediateur === null ? [] : [mediateur]), ...equipe]),
        ],
      }
    : mediateur !== null
      ? { type: 'Mediateur', mediateur }
      : null
