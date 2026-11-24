import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { UtilisateurId } from '@/features/utilisateurs/domain'

export const noterLAvertissement = async (
  utilisateurId: UtilisateurId,
  avertiLe: Date,
): Promise<void> => {
  await prismaClient.user.update({
    where: { id: utilisateurId },
    data: { avertissementInactiviteLe: avertiLe },
  })
}
