import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

export const getFirstAndLastActiviteDate = async ({
  mediateurIds,
}: {
  mediateurIds: string[]
}): Promise<ActiviteDates> => {
  if (mediateurIds.length === 0) {
    return {
      first: undefined,
      last: undefined,
    }
  }

  const result =
    mediateurIds.length === 1
      ? await prismaClient.$queryRaw<
          { first: Date | null; last: Date | null }[]
        >`
            SELECT
              MIN(date) AS first,
              MAX(date) AS last
            FROM activites
            WHERE mediateur_id = ${mediateurIds[0]}::UUID
        `
      : await prismaClient.$queryRaw<
          { first: Date | null; last: Date | null }[]
        >`
            SELECT
              MIN(date) AS first,
              MAX(date) AS last
            FROM activites
            WHERE mediateur_id = ANY(ARRAY[${Prisma.join(mediateurIds)}]::UUID[])
        `

  return {
    first: result.at(0)?.first ?? undefined,
    last: result.at(0)?.last ?? undefined,
  }
}

export type ActiviteDates = {
  first: Date | undefined
  last: Date | undefined
}
