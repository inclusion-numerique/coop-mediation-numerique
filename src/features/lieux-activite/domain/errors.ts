import type { LieuId } from './lieu-id'
import type { MediateurId } from './mediateur-id'
import type { RattachementId } from './rattachement-id'

export type LieuIntrouvable = {
  readonly _tag: 'LieuIntrouvable'
  readonly id: LieuId
}

export const LieuIntrouvable = (id: LieuId): LieuIntrouvable => ({
  _tag: 'LieuIntrouvable',
  id,
})

export type RattachementIntrouvable = {
  readonly _tag: 'RattachementIntrouvable'
  readonly mediateurId: MediateurId
  readonly lieuId: LieuId
}

export const RattachementIntrouvable = (
  mediateurId: MediateurId,
  lieuId: LieuId,
): RattachementIntrouvable => ({
  _tag: 'RattachementIntrouvable',
  mediateurId,
  lieuId,
})

export type RattachementDejaTermine = {
  readonly _tag: 'RattachementDejaTermine'
  readonly id: RattachementId
  readonly fin: Date
}

export const RattachementDejaTermine = (
  id: RattachementId,
  fin: Date,
): RattachementDejaTermine => ({ _tag: 'RattachementDejaTermine', id, fin })
