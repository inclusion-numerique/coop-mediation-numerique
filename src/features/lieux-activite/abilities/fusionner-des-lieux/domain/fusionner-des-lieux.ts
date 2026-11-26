import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import { type EchecDeFusion, LieuIntrouvable } from './errors'

type Fusion = {
  readonly source: LieuId
  readonly cible: LieuId
}

export type LieuxExistants = (
  lieux: readonly LieuId[],
) => Promise<readonly LieuId[]>

export type FusionnerLesLieux = (fusion: Fusion) => Promise<void>

export const fusionnerDesLieux =
  ({
    lieuxExistants,
    fusionner,
  }: {
    readonly lieuxExistants: LieuxExistants
    readonly fusionner: FusionnerLesLieux
  }) =>
  async ({ source, cible }: Fusion): Promise<Result<void, EchecDeFusion>> => {
    const existants = await lieuxExistants([source, cible])
    const introuvable = [source, cible].find(
      (lieu) => !existants.includes(lieu),
    )

    if (introuvable !== undefined) return failure(LieuIntrouvable(introuvable))

    await fusionner({ source, cible })

    return success(undefined)
  }
