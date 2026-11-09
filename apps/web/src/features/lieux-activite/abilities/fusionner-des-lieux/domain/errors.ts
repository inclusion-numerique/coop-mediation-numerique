import type { LieuId } from '../../../domain/lieu-id'

export type LieuIntrouvable = {
  readonly _tag: 'LieuIntrouvable'
  readonly lieuId: LieuId
}

export const LieuIntrouvable = (lieuId: LieuId): LieuIntrouvable => ({
  _tag: 'LieuIntrouvable',
  lieuId,
})

export type EchecDeFusion = LieuIntrouvable
