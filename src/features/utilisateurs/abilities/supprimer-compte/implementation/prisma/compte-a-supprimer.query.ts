import {
  compteASupprimerSelect,
  compteASupprimerToDomain,
} from '@/features/utilisateurs/db/compte.transfer'
import {
  type CompteASupprimer,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { prismaClient } from '@/prismaClient'

export const compteASupprimer = async (
  utilisateurId: UtilisateurId,
): Promise<CompteASupprimer | null> => {
  const row = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: compteASupprimerSelect,
  })

  return row === null ? null : compteASupprimerToDomain(row)
}
