import type { Endroit, LieuCandidatCoop } from './destination-du-lieu'
import type { Lieu } from './lieu'
import type { SectionDeLaFiche } from './section-de-la-fiche'

export type LieuxAuMemeEndroit = (
  endroit: Endroit,
) => Promise<readonly LieuCandidatCoop[]>

export type EnregistrerLesSections = (entree: {
  readonly lieu: Lieu
  readonly sections: readonly SectionDeLaFiche[]
  readonly maintenant: Date
}) => Promise<void>
