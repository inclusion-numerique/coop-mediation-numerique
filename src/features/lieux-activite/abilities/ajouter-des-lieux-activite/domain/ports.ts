import type { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { LieuxAuMemeEndroit } from '../../../domain/ports'
import type { AjoutDeLieux } from './ajout-de-lieux'
import type { LieuCarto } from './lieu-carto'
import type { LieuDejaRattache } from './lieu-demande'

export type TrouverStructuresCarto = (
  cartoIds: readonly string[],
) => Promise<ReadonlyMap<string, LieuCarto>>

export type LireLieuxDejaRattaches = (
  mediateurId: MediateurId,
) => Promise<readonly LieuDejaRattache[]>

export type EtatDuLieu = 'Actif' | 'Inactif'

export type LireLEtatDuLieu = (lieuId: LieuId) => Promise<EtatDuLieu | null>

export type LieuPorteurDeLaCarto = (
  identifiant: IdentifiantCartographie,
) => Promise<LieuId | null>

export type NouvelIdentifiantDeLieu = () => LieuId

export type RattachementAuxLieux =
  | { readonly _tag: 'Rattaches' }
  | { readonly _tag: 'LieuDisparu'; readonly lieuId: LieuId }

export type RattacherAuxLieux = (
  ajout: AjoutDeLieux,
) => Promise<RattachementAuxLieux>

export type DestinationDuLieuDecritPorts = {
  readonly lieuxAuMemeEndroit: LieuxAuMemeEndroit
  readonly nouvelIdentifiantDeLieu: NouvelIdentifiantDeLieu
}

export type PlanifierLesRattachementsPorts = DestinationDuLieuDecritPorts & {
  readonly etatDuLieu: LireLEtatDuLieu
  readonly lieuPorteurDeLaCarto: LieuPorteurDeLaCarto
}

export type LieuCorreleAuLieuDecritPorts = {
  readonly lieuxAuMemeEndroit: LieuxAuMemeEndroit
}

export type AjouterDesLieuxActivitePorts = PlanifierLesRattachementsPorts & {
  readonly trouverStructuresCarto: TrouverStructuresCarto
  readonly lireLieuxDejaRattaches: LireLieuxDejaRattaches
  readonly rattacherAuxLieux: RattacherAuxLieux
}
