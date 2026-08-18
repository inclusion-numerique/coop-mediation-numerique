import { getDernieresActivitesFor } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import type { ActiviteGrouped } from '@app/web/features/activites/use-cases/list/db/getActivitesCoordinationByQuarter'
import { getActivitesCoordinationByQuarter } from '@app/web/features/activites/use-cases/list/db/getActivitesCoordinationByQuarter'
import { blocRdvAccueil } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/consulter-rdvs-accueil.binding'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { countMediateursCoordonnesBy } from '@app/web/mediateurs/countMediateursCoordonnesBy'
import type {
  UserDisplayName,
  UserId,
  UserMediateur,
  UserProfile,
  UserRdvAccount,
  UserTimezone,
} from '@app/web/utils/user'

/**
 * Ce que l'accueil affiche, réuni en une lecture. Chaque morceau est demandé à
 * la feature qui le possède : l'accueil ne lit aucune table lui-même.
 */
export const getAccueilPageDataFor = async (
  user: UserDisplayName &
    UserProfile &
    UserId &
    UserRdvAccount &
    UserTimezone &
    UserMediateur,
) => {
  const [mediateurs, blocRdv, activites, activitesCoordinationByQuarter] =
    await Promise.all([
      countMediateursCoordonnesBy(user.coordinateur),
      blocRdvAccueil(UtilisateurCoopId(user.id), new Date()),
      user.mediateur?.id != null
        ? getDernieresActivitesFor({ mediateurId: user.mediateur.id, user })
        : [],
      user.coordinateur?.id == null
        ? ({} as ActiviteGrouped)
        : getActivitesCoordinationByQuarter(user.coordinateur.id),
    ])

  return {
    mediateurs,
    activites,
    widgetRdv: blocRdv.widget,
    synchroniserRdvsAuChargement: blocRdv.synchroniserAuChargement,
    activitesCoordinationByQuarter,
  }
}

export type AccueilPageData = Awaited<ReturnType<typeof getAccueilPageDataFor>>
