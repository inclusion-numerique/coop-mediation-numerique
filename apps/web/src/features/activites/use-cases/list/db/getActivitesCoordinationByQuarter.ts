import { prismaClient } from '@app/web/prismaClient'
import { getQuarter } from 'date-fns'

type ActiviteType = 'Evenement' | 'Partenariat' | 'Animation'

type ActiviteCount = { type: ActiviteType; count: number }

export type ActiviteGrouped = Record<string, ActiviteCount[]>

const ACTIVITE_TYPES: ActiviteType[] = ['Animation', 'Evenement', 'Partenariat']

const initCounts = (): ActiviteCount[] =>
  ACTIVITE_TYPES.map((type) => ({ type, count: 0 }))

const increment =
  (type: ActiviteType) =>
  (activiteCounts?: ActiviteCount[]): ActiviteCount[] =>
    (activiteCounts ?? initCounts()).map((activiteCount) =>
      activiteCount.type === type
        ? { ...activiteCount, count: activiteCount.count + 1 }
        : activiteCount,
    )

const quarterKey = (date: Date) => `${date.getFullYear()}-q${getQuarter(date)}`

export const getActivitesCoordinationByQuarter = async (
  coordinateurId: string,
): Promise<ActiviteGrouped> => {
  const activites = await prismaClient.activiteCoordination.findMany({
    where: { coordinateurId, suppression: null },
    select: { type: true, date: true },
  })

  return activites.reduce<ActiviteGrouped>(
    (acc, { date, type }) => {
      const key = quarterKey(new Date(date))
      return {
        ...acc,
        [key]: increment(type)(acc[key]),
        all: increment(type)(acc.all),
      }
    },
    { all: initCounts() },
  )
}
