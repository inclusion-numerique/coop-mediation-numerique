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
  const [mediateurs, dashboardRdvData, lastActivitesWithoutTimezone,activitesCoordination] =
    await Promise.all([
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
        ? []
        : (
          await prismaClient.activiteCoordination.groupBy({
            by: ['type'],
            where: {
              coordinateurId: user.coordinateur.id,
              suppression: null,
            },
            _count: {
              _all: true,
            },
          })
        ).map((activite) => ({
          type: activite.type,
          count: activite._count._all,
        }))
    ])

  if (lastActivitesWithoutTimezone != null) {
    const activites = lastActivitesWithoutTimezone
      .map(addTimezoneToActivite(user))
      .map((activite) => ({
        ...activite,
        rdv: activite.rdv ? addRdvBadgeStatus(activite.rdv) : null,
      }))

    // Return rdvs for dashboard info if user has a valid rdv account
    return {
      mediateurs,
      activites,
      rdvs: dashboardRdvData,
    }
  }

  return {
    mediateurs,
    activites: [],
    rdvs: null,
    activitesCoordination,
    syncDataOnLoad: false,
  }
}

export type AccueilPageData = Awaited<ReturnType<typeof getAccueilPageDataFor>>
