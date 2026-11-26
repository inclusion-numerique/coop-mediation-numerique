import { type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import { correler, type LieuAMaterialiser } from '../../../domain/lieu-identite'
import { endroitDe } from '../../../domain/reconnaitre-le-lieu'
import type { LieuCorreleAuLieuDecritPorts } from './ports'

export const lieuCorreleAuLieuDecrit =
  ({ lieuxAuMemeEndroit }: LieuCorreleAuLieuDecritPorts) =>
  async ({
    lieu,
  }: {
    readonly lieu: LieuAMaterialiser
  }): Promise<Result<LieuId | null, never>> => {
    const endroit = endroitDe(lieu)

    if (endroit === null) return success(null)

    return success(
      correler(await lieuxAuMemeEndroit(endroit), lieu)?.id ?? null,
    )
  }
