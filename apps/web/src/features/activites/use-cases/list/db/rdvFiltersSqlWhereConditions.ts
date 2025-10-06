import { Prisma } from '@prisma/client'

export const rdvFiltersWhereClause = ({
  rdvAccountIds,
  shouldFetchRdvs,
  includeRdvsWithAssociatedActivites = false,
}: {
  rdvAccountIds: number[] // should always be 1 or more
  shouldFetchRdvs: boolean // disable the query at the sql level
  includeRdvsWithAssociatedActivites: boolean // include rdvs with associated activites
}) => {
  const clauses = [
    rdvAccountIds.length === 0
      ? Prisma.sql`FALSE`
      : rdvAccountIds.length === 1
        ? Prisma.sql`rdv.rdv_account_id = ${rdvAccountIds[0]}`
        : Prisma.sql`rdv.rdv_account_id = ANY(${Prisma.join(rdvAccountIds)}::int[])`,
    shouldFetchRdvs ? Prisma.sql`TRUE` : Prisma.sql`FALSE`,
    includeRdvsWithAssociatedActivites
      ? Prisma.sql`TRUE`
      : Prisma.sql`act.id IS NULL`,
  ]

  return Prisma.join(clauses, ' AND ')
}
