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

  const firstDate = await prismaClient.$queryRaw<{ date: Date }[]>`
      SELECT MIN(date) AS date
      FROM activites
      WHERE mediateur_id = ANY(ARRAY[${Prisma.join(mediateurIds.map((id) => `${id}`))}]::UUID[])
  `

  const lastDate = await prismaClient.$queryRaw<{ date: Date }[]>`
      SELECT MAX(date) AS date
      FROM activites
      WHERE mediateur_id = ANY(ARRAY[${Prisma.join(mediateurIds.map((id) => `${id}`))}]::UUID[])
  `

  return {
    first: firstDate.at(0)?.date ?? undefined,
    last: lastDate.at(0)?.date ?? undefined,
  }
}

export type ActiviteDates = {
  first: Date | undefined
  last: Date | undefined
}
