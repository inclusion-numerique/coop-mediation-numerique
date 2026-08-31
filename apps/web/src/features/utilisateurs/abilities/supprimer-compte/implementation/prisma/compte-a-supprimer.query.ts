import {
  compteASupprimerSelect,
  compteASupprimerToDomain,
} from '@app/web/features/utilisateurs/db/compte.transfer'
import {
  type CompteASupprimer,
  type UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Lecture par identifiant seul : la garde d'appartenance ne se joue pas ici mais
 * dans la décision du domaine, qui reçoit l'auteur. Les trois chemins lisent le
 * même compte ; ils n'ont pas les mêmes droits dessus.
 */
export const compteASupprimer = async (
  utilisateurId: UtilisateurId,
): Promise<CompteASupprimer | null> => {
  const row = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: compteASupprimerSelect,
  })

  return row === null ? null : compteASupprimerToDomain(row)
}
