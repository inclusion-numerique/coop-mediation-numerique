import { prismaClient } from '@/configuration/prisma/prisma-client'
import {
  type CompteASupprimer,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import {
  compteASupprimerSelect,
  compteASupprimerToDomain,
} from '@/features/utilisateurs/implementations/prisma/compte.transfer'

export const compteASupprimer = async (
  utilisateurId: UtilisateurId,
): Promise<CompteASupprimer | null> => {
  const row = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: compteASupprimerSelect,
  })

  return row === null ? null : compteASupprimerToDomain(row)
}
