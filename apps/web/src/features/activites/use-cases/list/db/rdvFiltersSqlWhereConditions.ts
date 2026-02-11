import { Prisma } from '@prisma/client'

export const rdvFiltersWhereClause = ({
  rdvAccountIds,
  shouldFetchRdvs,
  rdvUserIds,
  includeRdvsWithAssociatedActivites = false,
}: {
  rdvAccountIds: number[] // should always be 1 or more
  shouldFetchRdvs: boolean // disable the query at the sql level
  rdvUserIds?: number[] // empty array will return no rdv, undefined will return all rdvs
  includeRdvsWithAssociatedActivites: boolean // include rdvs with associated activites
}) => {
  const clauses = [
    rdvAccountIds.length === 0
      ? Prisma.sql`FALSE`
      : rdvAccountIds.length === 1
        ? Prisma.sql`rdv.rdv_account_id = ${rdvAccountIds[0]}`
        : Prisma.sql`rdv.rdv_account_id = ANY(${Prisma.join(rdvAccountIds)}::int[])`,
    shouldFetchRdvs ? Prisma.sql`TRUE` : Prisma.sql`FALSE`,
    Prisma.sql`rdv.cra_declined = FALSE`,
    includeRdvsWithAssociatedActivites
      ? Prisma.sql`TRUE`
      : Prisma.sql`act.id IS NULL`,
    !rdvUserIds
      ? Prisma.sql`TRUE`
      : rdvUserIds.length === 0
        ? Prisma.sql`FALSE`
        : Prisma.sql`EXISTS (SELECT 1 FROM rdv_participations WHERE rdv_participations.rdv_id = rdv.id AND rdv_participations.user_id = ANY(${rdvUserIds}::int[]))`,
  ]

  return Prisma.join(clauses, ' AND ')
}
