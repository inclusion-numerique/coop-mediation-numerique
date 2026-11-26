import { prismaClient } from '@/configuration/prisma'
import { type UtilisateurId } from '@/features/utilisateurs/domain'
import {
  type EchecTechnique,
  enEchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'

export const noterLAvertissement = async (
  utilisateurId: UtilisateurId,
  avertiLe: Date,
): Promise<Result<void, EchecTechnique>> => {
  try {
    await prismaClient.user.update({
      where: { id: utilisateurId },
      data: { avertissementInactiviteLe: avertiLe },
    })
    return success(undefined)
  } catch (erreur) {
    return failure(enEchecTechnique(erreur))
  }
}
