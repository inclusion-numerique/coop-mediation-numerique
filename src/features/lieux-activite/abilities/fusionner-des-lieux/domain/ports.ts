import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { FicheFusionnable } from './fiche-fusionnable'
import type { FusionDeLieux } from './fusion-de-lieux'

export type FichesAFusionner = (
  lieux: readonly LieuId[],
) => Promise<readonly FicheFusionnable[]>

export type MediateursDesLieux = (lieux: {
  readonly source: LieuId
  readonly cible: LieuId
}) => Promise<{
  readonly rattachesALaSource: readonly MediateurId[]
  readonly enActiviteDansLaCible: readonly MediateurId[]
}>

export type FusionDesLieux =
  | { readonly _tag: 'Fusionnes' }
  | { readonly _tag: 'LieuDisparu'; readonly lieuId: LieuId }

export type FusionnerLesLieux = (
  fusion: FusionDeLieux,
) => Promise<FusionDesLieux>

export type FusionnerDesLieuxPorts = {
  readonly fichesAFusionner: FichesAFusionner
  readonly mediateursDesLieux: MediateursDesLieux
  readonly fusionner: FusionnerLesLieux
}
