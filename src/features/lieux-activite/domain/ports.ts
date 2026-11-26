import type { Endroit, LieuCandidatCoop } from './destination-du-lieu'
import type { LieuId } from './identifiants/lieu-id'
import type { Lieu } from './lieu'
import type { SectionDeLaFiche } from './section-de-la-fiche'

export type LieuxAuMemeEndroit = (
  endroit: Endroit,
) => Promise<readonly LieuCandidatCoop[]>

export type NouvelIdentifiantDeLieu = () => LieuId

export type DestinationDuLieuDecritPorts = {
  readonly lieuxAuMemeEndroit: LieuxAuMemeEndroit
  readonly nouvelIdentifiantDeLieu: NouvelIdentifiantDeLieu
}

export type LieuCorreleAuLieuDecritPorts = {
  readonly lieuxAuMemeEndroit: LieuxAuMemeEndroit
}

export type EnregistrerLesSections = (entree: {
  readonly lieu: Lieu
  readonly sections: readonly SectionDeLaFiche[]
  readonly maintenant: Date
}) => Promise<void>
