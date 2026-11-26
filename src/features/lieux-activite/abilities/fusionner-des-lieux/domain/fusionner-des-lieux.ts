import { failure, type Result, success } from '@/libraries/result'
import { LieuIntrouvable } from '../../../domain/errors'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { EchecDeFusionnerDesLieux } from './errors'
import type { FusionDeLieux } from './fusion-de-lieux'
import type { FusionnerDesLieuxPorts } from './ports'

export const fusionnerDesLieux =
  ({ lieuxExistants, fusionner }: FusionnerDesLieuxPorts) =>
  async ({
    source,
    cible,
    maintenant,
  }: {
    readonly source: LieuId
    readonly cible: LieuId
    readonly maintenant: Date
  }): Promise<Result<FusionDeLieux, EchecDeFusionnerDesLieux>> => {
    const existants = await lieuxExistants([source, cible])
    const introuvable = [source, cible].find(
      (lieu) => !existants.includes(lieu),
    )

    if (introuvable !== undefined) return failure(LieuIntrouvable(introuvable))

    const fusion: FusionDeLieux = { source, cible, fusionneLe: maintenant }
    const { fusionne } = await fusionner(fusion)

    return fusionne ? success(fusion) : failure(LieuIntrouvable(source))
  }
