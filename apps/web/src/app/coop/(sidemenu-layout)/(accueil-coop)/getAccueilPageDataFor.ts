import { ActiviteListItem } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { getActivitesListPageData } from '@app/web/features/activites/use-cases/list/getActivitesListPageData'
import { countMediateursCoordonnesBy } from '@app/web/mediateurs/countMediateursCoordonnesBy'
import { getRdvOauthIntegrationStatus } from '@app/web/rdv-service-public/rdvIntegrationOauthStatus'
import type {
  UserDisplayName,
  UserId,
  UserProfile,
  UserRdvAccount,
  UserTimezone,
} from '@app/web/utils/user'

export const getAccueilPageDataFor = async (
  user: UserDisplayName & UserProfile & UserId & UserRdvAccount & UserTimezone,
) => {
  const mediateurs = await countMediateursCoordonnesBy(user.coordinateur)

  // TODO Return null for rdvs if user has no valid rdv account
  if (user.mediateur?.id != null) {
    const {
      searchResult: { activites: activitesWithoutTimezone },
      rdvsWithoutActivite,
    } = await getActivitesListPageData({
      mediateurId: user.mediateur.id,
      searchParams: { lignes: '3' },
      user,
    })

    const activites = activitesWithoutTimezone.map(
      (activite) =>
        ({
          ...activite,
          timezone: user.timezone,
        }) satisfies ActiviteListItem,
    )

    const now = new Date()

    const rdvsIntegrationStatus = getRdvOauthIntegrationStatus({ user })

    // Do not return rdvs if user has no valid rdv account
    if (rdvsIntegrationStatus !== 'success') {
      return {
        mediateurs,
        activites,
        rdvs: null,
      }
    }

    const rdvsFutur = rdvsWithoutActivite.filter((rdv) => rdv.endDate >= now)
    const rdvsPasses = rdvsWithoutActivite.filter(
      (rdv) => rdv.status === 'unknown' && rdv.endDate < now,
    )
    const rdvsHonores = rdvsWithoutActivite.filter(
      (rdv) => rdv.status === 'seen',
    )

    // Return rdvs for dashboard info if user has a valid rdv account
    return {
      mediateurs,
      activites,
      rdvs: {
        next: rdvsFutur.length > 0 ? rdvsFutur.at(0) : null,
        futur: rdvsFutur,
        passes: rdvsPasses,
        honores: rdvsHonores,
      },
    }
  }

  return {
    mediateurs,
    activites: [],
    rdvs: null,
  }
}

export type AccueilPageData = Awaited<ReturnType<typeof getAccueilPageDataFor>>

export type AccueilRdvsData = Exclude<AccueilPageData['rdvs'], null>
