import { ActiviteSource } from '@app/web/features/activites/use-cases/source/activiteSource'
import { Prisma } from '@prisma/client'

export const activitesSourceWhereCondition = (source?: ActiviteSource) => {
  if (source === 'v1') {
    return Prisma.sql`act.v1_cra_id IS NOT NULL`
  }

  if (source === 'v2') {
    return Prisma.sql`act.v1_cra_id IS NULL`
  }

  return Prisma.sql`1 = 1`
}
