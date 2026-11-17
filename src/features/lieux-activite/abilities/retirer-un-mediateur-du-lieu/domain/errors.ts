import type { LieuId } from '../../../domain/lieu-id'
import type { MediateurId } from '../../../domain/mediateur-id'

export type PasEnActiviteSurCeLieu = {
  readonly _tag: 'PasEnActiviteSurCeLieu'
  readonly mediateurId: MediateurId
  readonly lieuId: LieuId
}

export const PasEnActiviteSurCeLieu = (
  mediateurId: MediateurId,
  lieuId: LieuId,
): PasEnActiviteSurCeLieu => ({
  _tag: 'PasEnActiviteSurCeLieu',
  mediateurId,
  lieuId,
})

export type RetraitNonAutorise = {
  readonly _tag: 'RetraitNonAutorise'
  readonly mediateurId: MediateurId
}

export const RetraitNonAutorise = (
  mediateurId: MediateurId,
): RetraitNonAutorise => ({ _tag: 'RetraitNonAutorise', mediateurId })

export type EchecDeRetrait = PasEnActiviteSurCeLieu | RetraitNonAutorise
