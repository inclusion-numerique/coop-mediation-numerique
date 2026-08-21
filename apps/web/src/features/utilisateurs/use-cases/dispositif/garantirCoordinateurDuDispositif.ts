import { prismaClient } from '@app/web/prismaClient'

/**
 * Garantit la ligne `coop.coordinateurs` de qui coordonne dans le dispositif.
 *
 * C'est le seul effet que la dérivation ne peut pas produire. Le statut de coordinateur se LIT dans
 * `main` (`is_coordinateur`, et l'affectation `idposte` active pour le dispositif), mais la ligne
 * coop, elle, ne peut pas être calculée : elle est la cible de clés étrangères dans tout le schéma —
 * médiateurs coordonnés, invitations d'équipe, tags, activités de coordination, partage de
 * statistiques. On ne rattache pas une invitation à un booléen.
 *
 * Appelée à la connexion et par le job nocturne, pour la même raison qu'`ensurePersonneMain` :
 * garantir l'existence au moment où on en a besoin, plutôt que d'entretenir une synchro préventive.
 *
 * On ne SUPPRIME jamais — règle héritée et délibérée : retirer le rôle à quelqu'un qui sort du
 * dispositif orphelinerait les équipes qu'il coordonne.
 *
 * `main.*` est qualifié explicitement : le `search_path` (`coop,public`) ne l'inclut pas.
 */
export const garantirCoordinateurDuDispositif = async (
  userId: string,
): Promise<{ cree: boolean }> => {
  const existant = await prismaClient.coordinateur.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (existant) return { cree: false }

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

  if (!dispositif?.doit_coordonner) return { cree: false }

  await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })

  return { cree: true }
}
