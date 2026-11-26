import { prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '@/features/utilisateurs/domain'

export const compteExiste = async (
  utilisateurId: UtilisateurId,
): Promise<boolean> =>
  (await prismaClient.user.count({ where: { id: utilisateurId } })) > 0
