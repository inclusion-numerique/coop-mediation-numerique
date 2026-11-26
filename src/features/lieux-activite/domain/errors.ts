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
