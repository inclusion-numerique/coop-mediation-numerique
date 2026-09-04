import type { LieuId } from '../../../domain/lieu-id'

export type FicheIntrouvable = {
  readonly _tag: 'FicheIntrouvable'
  readonly id: LieuId
}

export const FicheIntrouvable = (id: LieuId): FicheIntrouvable => ({
  _tag: 'FicheIntrouvable',
  id,
})

export type EchecDeModification = FicheIntrouvable
