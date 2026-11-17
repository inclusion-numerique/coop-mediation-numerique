import type { UtilisateurId } from '@/features/utilisateurs/domain'
import { prismaClient } from '@/prismaClient'

export const noterLAvertissement = async (
  utilisateurId: UtilisateurId,
  avertiLe: Date,
): Promise<void> => {
  await prismaClient.user.update({
    where: { id: utilisateurId },
    data: { avertissementInactiviteLe: avertiLe },
  })
}
