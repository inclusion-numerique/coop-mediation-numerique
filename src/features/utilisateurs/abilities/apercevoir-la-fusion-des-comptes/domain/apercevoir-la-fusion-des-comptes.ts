import {
  CibleIntrouvable,
  SourceIntrouvable,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { type ApercuDeFusion, communs } from './apercu-de-fusion'
import type { EchecDApercevoirLaFusionDesComptes } from './errors'
import type { ApercevoirLaFusionDesComptesPorts } from './ports'

export const apercevoirLaFusionDesComptes =
  ({ lireLesComptesAApercevoir }: ApercevoirLaFusionDesComptesPorts) =>
  async ({
    sourceId,
    cibleId,
  }: {
    readonly sourceId: UtilisateurId | null
    readonly cibleId: UtilisateurId | null
  }): Promise<Result<ApercuDeFusion, EchecDApercevoirLaFusionDesComptes>> => {
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
