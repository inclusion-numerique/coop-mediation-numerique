import { failure, type Result, success } from '@app/web/libraries/result'
import {
  autoriserFusion,
  CibleIntrouvable,
  type FusionAutorisee,
  type FusionnerError,
  SourceIntrouvable,
} from '../domain'
import {
  comptesAFusionner,
  fusionner,
  retirerLaSourceDesListes,
} from '../implementation'

export const fusionnerDesComptes = async ({
  sourceId,
  cibleId,
}: {
  readonly sourceId: string
  readonly cibleId: string
}): Promise<Result<FusionAutorisee, FusionnerError>> => {
  const { source, cible } = await comptesAFusionner({ sourceId, cibleId })

  if (source === null) return failure(SourceIntrouvable())
  if (cible === null) return failure(CibleIntrouvable())

  const autorisation = autoriserFusion(source, cible)
  if (!autorisation.success) return autorisation

  await fusionner(autorisation.data)
  await retirerLaSourceDesListes(source.courriel)

  return success(autorisation.data)
}
