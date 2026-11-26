import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { LieuxAuMemeEndroit } from '../../../domain/ports'
import type { LieuCree } from './lieu-cree'

export type EnregistrementDuLieu =
  | { readonly _tag: 'Enregistre' }
  | { readonly _tag: 'LieuDisparu'; readonly lieuId: LieuId }

export type EnregistrerLieuActivite = (
  creation: LieuCree,
) => Promise<EnregistrementDuLieu>

export type CreerLieuActivitePorts = {
  readonly lieuxAuMemeEndroit: LieuxAuMemeEndroit
  readonly enregistrer: EnregistrerLieuActivite
}
