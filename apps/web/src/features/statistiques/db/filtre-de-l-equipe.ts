import { Prisma } from '@app/web/generated/prisma/client'

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
