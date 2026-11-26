import { prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '@/features/utilisateurs/domain'

export const fermerLesSessions = async (
  utilisateurId: UtilisateurId,
): Promise<number> =>
  (await prismaClient.session.deleteMany({ where: { userId: utilisateurId } }))
    .count
