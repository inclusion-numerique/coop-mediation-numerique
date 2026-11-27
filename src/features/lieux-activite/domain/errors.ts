import type { LieuId } from './identifiants/lieu-id'

export type MediateurRequis = { readonly _tag: 'MediateurRequis' }

export const MediateurRequis = (): MediateurRequis => ({
  _tag: 'MediateurRequis',
})

export type LieuIntrouvable = {
  readonly _tag: 'LieuIntrouvable'
  readonly lieuId: LieuId
}

export const LieuIntrouvable = (lieuId: LieuId): LieuIntrouvable => ({
  _tag: 'LieuIntrouvable',
  lieuId,
})

export type FicheIntrouvable = {
  readonly _tag: 'FicheIntrouvable'
  readonly id: LieuId
}

export const FicheIntrouvable = (id: LieuId): FicheIntrouvable => ({
  _tag: 'FicheIntrouvable',
  id,
})
