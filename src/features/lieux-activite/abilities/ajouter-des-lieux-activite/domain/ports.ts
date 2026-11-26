import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { AjoutDeLieux } from './ajout-de-lieux'
import type { LieuCarto } from './lieu-carto'
import type { LieuDejaRattache } from './lieu-demande'

export type TrouverStructuresCarto = (
  cartoIds: readonly string[],
) => Promise<ReadonlyMap<string, LieuCarto>>

export type LireLieuxDejaRattaches = (
  mediateurId: MediateurId,
) => Promise<readonly LieuDejaRattache[]>

export type RattacherAuxLieux = (
  ajout: AjoutDeLieux,
) => Promise<readonly LieuId[]>

export type AjouterDesLieuxActivitePorts = {
  readonly trouverStructuresCarto: TrouverStructuresCarto
  readonly lireLieuxDejaRattaches: LireLieuxDejaRattaches
  readonly rattacherAuxLieux: RattacherAuxLieux
}
