import { Prisma } from '@app/web/generated/prisma/client'
import type { CoordinateurId } from '../domain'

export const dansLaPeriodeDAppartenance = (
  coordinateurId: CoordinateurId | null,
): Prisma.Sql =>
  coordinateurId === null
    ? Prisma.sql`TRUE`
    : Prisma.sql`(
    EXISTS (SELECT 1
            FROM mediateurs_coordonnes mc
            WHERE mc.coordinateur_id = ${coordinateurId}::uuid
              AND mc.mediateur_id = act.mediateur_id
              AND (mc.suppression IS NULL OR act.date <= mc.suppression))
    OR NOT EXISTS (SELECT 1
                   FROM mediateurs_coordonnes mc
                   WHERE mc.coordinateur_id = ${coordinateurId}::uuid
                     AND mc.mediateur_id = act.mediateur_id)
  )`
