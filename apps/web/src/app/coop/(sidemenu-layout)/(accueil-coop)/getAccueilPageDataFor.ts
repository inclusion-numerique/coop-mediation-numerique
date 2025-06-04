import { getActivitesListPageData } from '@app/web/features/activites/use-cases/list/getActivitesListPageData'
import { countMediateursCoordonnesBy } from '@app/web/mediateurs/countMediateursCoordonnesBy'
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

  if (user.mediateur?.id != null) {
    const {
      searchResult: { activites },
      rdvsWithoutActivite,
    } = await getActivitesListPageData({
      mediateurId: user.mediateur.id,
      searchParams: { lignes: '3' },
      user,
    })

    const now = new Date()
    const rdvsFutur = rdvsWithoutActivite.filter((rdv) => rdv.date > now)
    const rdvsPasses = rdvsWithoutActivite.filter(
      (rdv) => rdv.status === 'unknown' && rdv.date < now,
    )
    const rdvsHonores = rdvsWithoutActivite.filter(
      (rdv) => rdv.status === 'seen',
    )

    return {
      mediateurs,
      activites,
      rdvs: {
        next: rdvsFutur.length > 0 ? rdvsFutur.at(-1) : null,
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
