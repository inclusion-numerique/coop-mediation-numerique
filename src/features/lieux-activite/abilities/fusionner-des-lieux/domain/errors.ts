import type { LieuIntrouvable } from '../../../domain/errors'

export type FusionIntrouvable = { readonly _tag: 'FusionIntrouvable' }

export const FusionIntrouvable = (): FusionIntrouvable => ({
  _tag: 'FusionIntrouvable',
})

export type EchecDeFusionnerDesLieux = LieuIntrouvable

export type EchecDApercevoirLaFusion = FusionIntrouvable
