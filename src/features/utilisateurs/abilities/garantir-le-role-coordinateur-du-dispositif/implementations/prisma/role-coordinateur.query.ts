import { prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '@/features/utilisateurs/domain'

export const aLeRoleCoordinateur = async (
  userId: UtilisateurId,
): Promise<boolean> =>
  (await prismaClient.coordinateur.count({ where: { userId } })) > 0

export const coordonneDansLeDispositif = async (
  userId: UtilisateurId,
): Promise<boolean> => {
  const [dispositif] = await prismaClient.$queryRaw<
    { doit_coordonner: boolean }[]
  >`
    SELECT (
      COALESCE(p.is_coordinateur, false)
      AND EXISTS (
        SELECT 1 FROM main.personne_affectations_emploi a
        WHERE a.personne_id = p.id AND a.source = 'idposte' AND a.est_active
      )
    ) AS doit_coordonner
    FROM main.personne p
    WHERE p.coop_id = ${userId}::uuid
    LIMIT 1`

  return dispositif?.doit_coordonner ?? false
}
