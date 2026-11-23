import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes'
import { failure, type Result, success } from '@/libraries/result'
import {
  autoriserFusion,
  CibleIntrouvable,
  type FusionAutorisee,
  type FusionnerError,
  SourceIntrouvable,
} from '../domain'
import { retirerLaSourceDesListes } from '../implementations/brevo/retirer-la-source-des-listes'
import { comptesAFusionner } from '../implementations/prisma/comptes-a-fusionner.query'
import { fusionner } from '../implementations/prisma/fusionner.mutation'

export const fusionnerDesComptes = async (
  {
    sourceId,
    cibleId,
  }: {
    readonly sourceId: string
    readonly cibleId: string
  },
  synchroniserLaPersonne: SynchroniserLaPersonne,
): Promise<Result<FusionAutorisee, FusionnerError>> => {
  const { source, cible } = await comptesAFusionner({ sourceId, cibleId })

  if (source === null) return failure(SourceIntrouvable())
  if (cible === null) return failure(CibleIntrouvable())

  const autorisation = autoriserFusion(source, cible)
  if (!autorisation.success) return autorisation

  await fusionner(synchroniserLaPersonne)(autorisation.data)
  await retirerLaSourceDesListes(source.courriel)

  return success(autorisation.data)
}
