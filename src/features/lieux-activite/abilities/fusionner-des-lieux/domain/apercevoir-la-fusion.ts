import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import { champsCommuns } from './champs-communs'
import { type EchecDApercevoirLaFusion, FusionIntrouvable } from './errors'
import type { FusionApercue } from './fusion-apercue'
import type { ApercevoirLaFusionPorts } from './ports'

export const apercevoirLaFusion =
  ({ lieuxAApercevoir }: ApercevoirLaFusionPorts) =>
  async ({
    source,
    cible,
  }: {
    readonly source: LieuId | null
    readonly cible: LieuId | null
  }): Promise<Result<FusionApercue, EchecDApercevoirLaFusion>> => {
    if (source === null || cible === null) return failure(FusionIntrouvable())

    const lus = await lieuxAApercevoir({ source, cible })

    if (lus.source === null || lus.cible === null)
      return failure(FusionIntrouvable())

    return success({
      mergeSource: lus.source,
      mergeTarget: lus.cible,
      mergeCommon: champsCommuns(lus.source, lus.cible),
    })
  }
