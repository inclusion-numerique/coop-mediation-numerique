import {
  compteASupprimerSelect,
  compteASupprimerToDomain,
} from '@app/web/features/utilisateurs/db/compte.transfer'
import {
  type CompteASupprimer,
  type UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

export const compteASupprimer = async (
  utilisateurId: UtilisateurId,
): Promise<CompteASupprimer | null> => {
  const row = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: compteASupprimerSelect,
  })

  return row === null ? null : compteASupprimerToDomain(row)
}
