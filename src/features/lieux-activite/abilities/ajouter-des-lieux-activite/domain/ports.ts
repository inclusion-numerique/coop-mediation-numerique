import type { MediateurId } from '../../../domain/mediateur-id'
import type { LieuCarto } from './lieu-carto'
import type { LieuDejaRattache } from './lieu-demande'

export type TrouverStructuresCarto = (
  cartoIds: readonly string[],
) => Promise<ReadonlyMap<string, LieuCarto>>

export type LireLieuxDejaRattaches = (
  mediateurId: MediateurId,
) => Promise<readonly LieuDejaRattache[]>

export type AjouterDesLieuxActivitePorts = {
  readonly trouverStructuresCarto: TrouverStructuresCarto
  readonly lireLieuxDejaRattaches: LireLieuxDejaRattaches
}
