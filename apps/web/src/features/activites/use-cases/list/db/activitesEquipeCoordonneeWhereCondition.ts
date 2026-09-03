import { Prisma } from '@prisma/client'

/**
 * Restreint les activités d'une équipe coordonnée à la période d'appartenance de chaque médiateur.
 * La requête doit nommer la table activites « act » exactement.
 *
 * Semi-jointure et non jointure : `mediateurs_coordonnes` garde une ligne par passage dans l'équipe,
 * donc joindre la table multiplie les accompagnements d'un médiateur ré-invité autant de fois qu'il
 * a de lignes valides à la date de l'activité.
 *
 * La seconde branche couvre les activités d'un médiateur que ce coordinateur n'a jamais coordonné —
 * en pratique le coordinateur lui-même quand il est aussi médiateur.
 */
export const activitesEquipeCoordonneeWhereCondition = (
  coordinateurId?: string,
) => {
  if (coordinateurId == null) {
    return Prisma.sql`1 = 1`
  }

  return Prisma.sql`(
    EXISTS (SELECT 1
            FROM mediateurs_coordonnes mc
            WHERE mc.coordinateur_id = ${coordinateurId}::UUID
              AND mc.mediateur_id = act.mediateur_id
              AND (mc.suppression IS NULL OR act.date <= mc.suppression))
    OR NOT EXISTS (SELECT 1
                   FROM mediateurs_coordonnes mc
                   WHERE mc.coordinateur_id = ${coordinateurId}::UUID
                     AND mc.mediateur_id = act.mediateur_id)
  )`
}
