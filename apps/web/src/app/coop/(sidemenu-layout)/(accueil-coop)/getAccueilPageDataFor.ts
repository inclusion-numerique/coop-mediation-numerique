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
    } = await getActivitesListPageData({
      mediateurId: user.mediateur.id,
      searchParams: { lignes: '3' },
      user,
    })

    return {
      mediateurs,
      activites,
    }
  }

  return {
    mediateurs,
    activites: [],
  }
}

export type AccueilPageData = Awaited<ReturnType<typeof getAccueilPageDataFor>>
