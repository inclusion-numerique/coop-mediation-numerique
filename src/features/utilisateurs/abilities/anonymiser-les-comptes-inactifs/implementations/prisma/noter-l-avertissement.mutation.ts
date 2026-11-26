import { prismaClient } from '@/configuration/prisma'
import {
  EchecTechnique,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'

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
    return failure(
      EchecTechnique(erreur instanceof Error ? erreur.message : String(erreur)),
    )
  }
}
