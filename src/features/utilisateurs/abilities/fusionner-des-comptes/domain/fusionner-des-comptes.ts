import { failure, type Result, success } from '@/libraries/result'
import { autoriserFusion, type FusionAutorisee } from './compte-a-fusionner'
import {
  CibleIntrouvable,
  type FusionnerError,
  SourceIntrouvable,
} from './errors'
import type { FusionnerDesComptesPorts } from './ports'

export const fusionnerDesComptes =
  ({
    lireLesComptesAFusionner,
    fusionner,
    retirerLaSourceDesListes,
  }: FusionnerDesComptesPorts) =>
  async (ids: {
    readonly sourceId: string
    readonly cibleId: string
  }): Promise<Result<FusionAutorisee, FusionnerError>> => {
    const { source, cible } = await lireLesComptesAFusionner(ids)

    if (source === null) return failure(SourceIntrouvable())
    if (cible === null) return failure(CibleIntrouvable())

    const autorisation = autoriserFusion(source, cible)
    if (!autorisation.success) return autorisation

    await fusionner(autorisation.data)
    await retirerLaSourceDesListes(source.courriel)

    return success(autorisation.data)
  }
