import { type Result, success } from '@/libraries/result'
import { Endroit } from './destination-du-lieu'
import type { LieuId } from './identifiants/lieu-id'
import { type LieuDecrit, lieuAMaterialiserDuLieuDecrit } from './lieu-decrit'
import { correler } from './lieu-identite'
import type { LieuCorreleAuLieuDecritPorts } from './ports'

export const lieuCorreleAuLieuDecrit =
  ({ lieuxAuMemeEndroit }: LieuCorreleAuLieuDecritPorts) =>
  async ({
    lieu,
  }: {
    readonly lieu: LieuDecrit
  }): Promise<Result<LieuId | null, never>> => {
    const { codeInsee, codePostal } = lieu.adresse

    return success(
      correler(
        await lieuxAuMemeEndroit(Endroit({ codeInsee, codePostal })),
        lieuAMaterialiserDuLieuDecrit(lieu),
      )?.id ?? null,
    )
  }
