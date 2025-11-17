import { activiteListSelect } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { addTimezoneToActivite } from '@app/web/features/activites/use-cases/list/db/addTimezoneToActivite'
import { addRdvBadgeStatus } from '@app/web/features/rdvsp/administration/db/addRdvBadgeStatus'
import { getDashboardRdvData } from '@app/web/features/rdvsp/queries/getDashboardRdvData'
import { countMediateursCoordonnesBy } from '@app/web/mediateurs/countMediateursCoordonnesBy'
import { prismaClient } from '@app/web/prismaClient'
import { getRdvOauthIntegrationStatus } from '@app/web/rdv-service-public/rdvIntegrationOauthStatus'
import type {
  UserDisplayName,
  UserId,
  UserMediateur,
  UserProfile,
  UserRdvAccount,
  UserTimezone,
} from '@app/web/utils/user'
import { getQuarter } from 'date-fns'

type ActiviteType = 'Evenement' | 'Partenariat' | 'Animation'

type ActiviteCount = { type: ActiviteType; count: number }

type ActiviteGrouped = Record<string, ActiviteCount[]>

const ACTIVITE_TYPES: ActiviteType[] = ['Evenement', 'Partenariat', 'Animation']

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

/**
 * Only here for correct typings for the user parameter
 */
const getDashboardRdvDataFor = (
  user: UserId & UserRdvAccount & UserMediateur,
) => {
  if (!user.rdvAccount || !user.mediateur) {
    return null
  }

  const rdvsIntegrationStatus = getRdvOauthIntegrationStatus({ user })

  if (rdvsIntegrationStatus !== 'success') {
    return null
  }

  // do not await and return a promise for using suspense in the frontend
  return getDashboardRdvData({
    user: {
      ...user,
      rdvAccount: user.rdvAccount,
    },
  })
}

export const getAccueilPageDataFor = async (
  user: UserDisplayName &
    UserProfile &
    UserId &
    UserRdvAccount &
    UserTimezone &
    UserMediateur,
) => {
  const [
    mediateurs,
    dashboardRdvData,
    lastActivitesWithoutTimezone,
    activitesCoordinationByQuarter,
  ] = await Promise.all([
    countMediateursCoordonnesBy(user.coordinateur),
    getDashboardRdvDataFor(user),
    user.mediateur?.id != null
      ? prismaClient.activite.findMany({
          where: {
            mediateurId: user.mediateur.id,
            suppression: null,
          },

          select: activiteListSelect,
          orderBy: {
            creation: 'desc',
          },
          take: 3,
        })
      : null,
    user.coordinateur?.id == null
      ? {}
      : await getActivitesCoordinationByQuarter(user.coordinateur.id),
  ])

  const activites = lastActivitesWithoutTimezone
    ? lastActivitesWithoutTimezone
        .map(addTimezoneToActivite(user))
        .map((activite) => ({
          ...activite,
          rdv: activite.rdv ? addRdvBadgeStatus(activite.rdv) : null,
        }))
    : []

  return {
    mediateurs,
    activites,
    rdvs: dashboardRdvData,
    activitesCoordinationByQuarter,
    syncDataOnLoad: dashboardRdvData ? dashboardRdvData.syncDataOnLoad : false,
  }
}

export type AccueilPageData = Awaited<ReturnType<typeof getAccueilPageDataFor>>
