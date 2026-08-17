import { activiteListSelect } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { addTimezoneToActivite } from '@app/web/features/activites/use-cases/list/db/addTimezoneToActivite'
import {
  synchroniserAuChargement,
  type WidgetRdvAccueil,
} from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/domain/widget-rdv'
import { consulterRdvsAccueil } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/consulter-rdvs-accueil'
import { compteDuMediateur } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/prisma/compte-du-mediateur.query'
import { lireDonneesAccueilRdv } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/prisma/donnees-accueil-rdv.query'
import { addRdvBadgeStatus } from '@app/web/features/rdvsp/db/badge-statut-rdv'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import { countMediateursCoordonnesBy } from '@app/web/mediateurs/countMediateursCoordonnesBy'
import { prismaClient } from '@app/web/prismaClient'
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

/**
 * L'état du bloc RDV — masqué, en alerte, ou avec ses données — est décidé par
 * l'ability, non recomposé ici : trois états exclusifs plutôt que des données et
 * une alerte calculées séparément, combinaison qui pouvait n'en produire aucune.
 */
const consulterRdvs = consulterRdvsAccueil({
  compteDuMediateur,
  lireDonnees: lireDonneesAccueilRdv,
})

const blocRdvPour = async (
  user: UserId & UserMediateur,
): Promise<{
  widgetRdv: WidgetRdvAccueil
  synchroniserRdvsAuChargement: boolean
}> => {
  if (!user.mediateur) {
    return {
      widgetRdv: { _tag: 'masque' },
      synchroniserRdvsAuChargement: false,
    }
  }

  const utilisateurId = UtilisateurCoopId(user.id)
  const compte = await compteDuMediateur(utilisateurId)

  return {
    widgetRdv: await consulterRdvs({ utilisateurId, maintenant: new Date() }),
    synchroniserRdvsAuChargement:
      compte !== null && synchroniserAuChargement(compte),
  }
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
    blocRdv,
    lastActivitesWithoutTimezone,
    activitesCoordinationByQuarter,
  ] = await Promise.all([
    countMediateursCoordonnesBy(user.coordinateur),
    blocRdvPour(user),
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
    ...blocRdv,
    activitesCoordinationByQuarter,
  }
}

export type AccueilPageData = Awaited<ReturnType<typeof getAccueilPageDataFor>>
