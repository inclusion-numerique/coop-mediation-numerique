import {
  ActiviteListItem,
  activiteListSelect,
} from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { getActivitesListPageData } from '@app/web/features/activites/use-cases/list/getActivitesListPageData'
import { getDashboardRdvData } from '@app/web/features/rdvsp/queries/getDashboardRdvData'
import { countMediateursCoordonnesBy } from '@app/web/mediateurs/countMediateursCoordonnesBy'
import { prismaClient } from '@app/web/prismaClient'
import { getRdvOauthIntegrationStatus } from '@app/web/rdv-service-public/rdvIntegrationOauthStatus'
import { createStopwatch } from '@app/web/utils/stopwatch'
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
  const mediateurs = await countMediateursCoordonnesBy(user.coordinateur)

  // keep this as a promise for using suspense in the frontend
  const dashboardRdvData = getDashboardRdvDataFor(user)

  // TODO Return null for rdvs if user has no valid rdv account
  if (user.mediateur?.id != null) {
    const lastActivitesWithoutTimezone = await prismaClient.activite.findMany({
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

    const activites = lastActivitesWithoutTimezone.map(
      (activite) =>
        ({
          ...activite,
          timezone: user.timezone,
        }) satisfies ActiviteListItem,
    )

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
  }
}

export type AccueilPageData = Awaited<ReturnType<typeof getAccueilPageDataFor>>
