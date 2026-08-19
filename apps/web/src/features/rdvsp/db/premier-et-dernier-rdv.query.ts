import { type ActiviteDates } from '@app/web/features/activites/use-cases/list/db/getFirstAndLastActiviteDate'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

export const getFirstAndLastRdvDate = async ({
  rdvAccountIds,
}: {
  rdvAccountIds: number[]
}): Promise<ActiviteDates> => {
  if (rdvAccountIds.length === 0) {
    return {
      first: undefined,
      last: undefined,
    }
  }

  const result =
    rdvAccountIds.length === 1
      ? await prismaClient.$queryRaw<
          { first: Date | null; last: Date | null }[]
        >`
            SELECT
              MIN(starts_at) AS first,
              MAX(starts_at) AS last
            FROM rdvs
            WHERE rdv_account_id = ${rdvAccountIds[0]}
        `
      : await prismaClient.$queryRaw<
          { first: Date | null; last: Date | null }[]
        >`
            SELECT
              MIN(starts_at) AS first,
              MAX(starts_at) AS last
            FROM rdvs
            WHERE rdv_account_id = ANY(ARRAY[${Prisma.join(rdvAccountIds)}])
        `

  return {
    first: result.at(0)?.first ?? undefined,
    last: result.at(0)?.last ?? undefined,
  }
}
