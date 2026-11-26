import type { Endroit, LieuCandidatCoop } from './destination-du-lieu'

export type LieuxAuMemeEndroit = (
  endroit: Endroit,
) => Promise<readonly LieuCandidatCoop[]>
