import { type Result, success } from '@/libraries/result'
import type { LieuId } from './identifiants/lieu-id'
import { correler, type LieuAMaterialiser } from './lieu-identite'
import type { LieuCorreleAuLieuDecritPorts } from './ports'
import { endroitDe } from './reconnaitre-le-lieu'

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
