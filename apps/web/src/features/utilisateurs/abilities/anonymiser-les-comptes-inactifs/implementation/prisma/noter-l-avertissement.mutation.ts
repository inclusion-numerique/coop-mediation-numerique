import type { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

export const noterLAvertissement = async (
  utilisateurId: UtilisateurId,
  avertiLe: Date,
): Promise<void> => {
  await prismaClient.user.update({
    where: { id: utilisateurId },
    data: { avertissementInactiviteLe: avertiLe },
  })
}
