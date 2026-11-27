import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { PlanifierLesRattachementsPorts } from '../../../domain/ports'
import type { LieuCarto } from '../../../domain/rattachement/lieu-carto'
import type { AjoutDeLieux } from './ajout-de-lieux'
import type { LieuDejaRattache } from './lieu-deja-rattache'

export type TrouverStructuresCarto = (
  cartoIds: readonly string[],
) => Promise<ReadonlyMap<string, LieuCarto>>

export type LireLieuxDejaRattaches = (
  mediateurId: MediateurId,
) => Promise<readonly LieuDejaRattache[]>

export type RattachementAuxLieux =
  | { readonly _tag: 'Rattaches' }
  | { readonly _tag: 'LieuDisparu'; readonly lieuId: LieuId }

export type RattacherAuxLieux = (
  ajout: AjoutDeLieux,
) => Promise<RattachementAuxLieux>

export type AjouterDesLieuxActivitePorts = PlanifierLesRattachementsPorts & {
  readonly trouverStructuresCarto: TrouverStructuresCarto
  readonly lireLieuxDejaRattaches: LireLieuxDejaRattaches
  readonly rattacherAuxLieux: RattacherAuxLieux
}
