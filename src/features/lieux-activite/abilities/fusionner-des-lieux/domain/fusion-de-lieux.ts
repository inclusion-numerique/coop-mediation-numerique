import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { EcritureAuRegistre } from '../../../domain/registre/ecriture-au-registre'
import type { FicheFusionnable } from './fiche-fusionnable'

export type FusionDeLieux = {
  readonly source: LieuId
  readonly cible: LieuId
  readonly fusionneLe: Date
  readonly fiche: FicheFusionnable
  readonly mediateursATransferer: readonly MediateurId[]
  readonly ecritureAuRegistre: EcritureAuRegistre
}
