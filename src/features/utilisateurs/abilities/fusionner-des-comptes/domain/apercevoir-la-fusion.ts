import type { UtilisateurId } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { type ApercuDeFusion, communs } from './apercu-de-fusion'
import {
  CibleIntrouvable,
  type EchecDApercevoirLaFusion,
  SourceIntrouvable,
} from './errors'
import type { ApercevoirLaFusionPorts } from './ports'

export const apercevoirLaFusion =
  ({ lireLesComptesAApercevoir }: ApercevoirLaFusionPorts) =>
  async ({
    sourceId,
    cibleId,
  }: {
    readonly sourceId: UtilisateurId | null
    readonly cibleId: UtilisateurId | null
  }): Promise<Result<ApercuDeFusion, EchecDApercevoirLaFusion>> => {
    if (sourceId === null) return failure(SourceIntrouvable())
    if (cibleId === null) return failure(CibleIntrouvable())

    const { source, cible } = await lireLesComptesAApercevoir({
      sourceId,
      cibleId,
    })

    if (source === null) return failure(SourceIntrouvable())
    if (cible === null) return failure(CibleIntrouvable())

    return success({
      source,
      cible,
      communs: communs(source.contenu, cible.contenu),
    })
  }
