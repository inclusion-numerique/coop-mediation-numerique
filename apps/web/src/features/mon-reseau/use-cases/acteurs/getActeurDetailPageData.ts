import { getTotalCountsStats } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getTotalCountsStats'
import type { SessionUser } from '@app/web/auth/sessionUser'
import { getContractInfo } from '@app/web/conseiller-numerique/getContractInfo'
import { findConseillerNumeriqueV1 } from '@app/web/external-apis/conseiller-numerique/searchConseillerNumeriqueV1'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { getActeurEmploiForDate } from '@app/web/features/mon-reseau/use-cases/acteurs/db/getActeurEmploiForDate'
import { acteurSelectForList } from '@app/web/features/mon-reseau/use-cases/acteurs/db/searchActeurs'
import { lieuxForListSelect } from '@app/web/features/mon-reseau/use-cases/lieux/db/searchLieux'
import { prismaClient } from '@app/web/prismaClient'
import { getLastUserActivityDate } from '@app/web/security/getLastUserActivityDate'
import { getMediateurCoordinationDetails } from './db/getMediateurCoordinationDetails'

const activitesFiltersLastDays = (daysCount: number) => {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - daysCount)
  const activitesFilters: ActivitesFilters = {
    du: currentDate.toISOString().split('T')[0],
    au: new Date().toISOString().split('T')[0],
  }
  return activitesFilters
}

export const getActeurDetailPageData = async ({
  userId,
  retourHref,
  retourLabel,
  sessionUser,
}: {
  userId: string
  retourHref: string
  retourLabel: string
  sessionUser: Pick<SessionUser, 'coordinateur'>
}) => {
  // Fetch user with mediateur and coordinateur relations
  const acteur = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      ...acteurSelectForList,
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      phone: true,
      created: true,
      mediateur: {
        select: {
          id: true,
          conseillerNumerique: {
            select: { id: true, idPg: true },
          },
        },
      },
      coordinateur: {
        select: {
          id: true,
          conseillerNumeriqueId: true,
          _count: {
            select: {
              mediateursCoordonnes: {
                where: { suppression: null },
              },
            },
          },
        },
      },
    },
  })

  if (acteur == null) return null

  const mediateurId = acteur.mediateur?.id ?? null

  // Determine acteur role
  const acteurRole = acteur.coordinateur
    ? 'coordinateur'
    : acteur.mediateur?.conseillerNumerique
      ? 'conseiller_numerique'
      : acteur.mediateur
        ? 'mediateur'
        : null

  const coordinationDetails =
    sessionUser.coordinateur && mediateurId
      ? await getMediateurCoordinationDetails({
          mediateurId,
          coordinateurId: sessionUser.coordinateur.id,
        })
      : null

  // Compute ActeurPage features depending on session user and acteur
  const acteurIsMediateurCoordonnne =
    !!coordinationDetails?.coordinations.current
  const acteurIsInvitedToTeam = !!coordinationDetails?.invitation

  const coordinationFeatures = sessionUser.coordinateur
    ? {
        coordinationDetails,
        acteurIsMediateurCoordonnne,
        acteurIsInvitedToTeam,
        showStats: acteurIsMediateurCoordonnne,
        showContract:
          acteurIsMediateurCoordonnne &&
          acteur.mediateur?.conseillerNumerique != null,
        showReferentStructure: acteurIsMediateurCoordonnne,
        canInviteToTeam: !acteurIsMediateurCoordonnne && !acteurIsInvitedToTeam,
        canRemoveFromTeam: acteurIsMediateurCoordonnne,
        canRemoveFromArchives:
          !acteurIsMediateurCoordonnne &&
          (coordinationDetails?.coordinations.history.length ?? 0) > 0,
      }
    : null

  // Fetch conseiller numerique idPg if needed
  // XXX Mongo V1 legacy feature to replace with dataspace info that will be sync in our db (contracts info)
  const conseillerNumerique = acteur.mediateur?.conseillerNumerique ?? null
  if (conseillerNumerique != null && conseillerNumerique.idPg == null) {
    const conumV1 = await findConseillerNumeriqueV1({
      id: conseillerNumerique.id,
      includeDeleted: true,
    })
    conseillerNumerique.idPg = conumV1?.conseiller.idPG ?? null
  }

  const contract =
    !!coordinationFeatures && coordinationFeatures.showContract
      ? await getContractInfo(acteur.email)
      : null

  // Get statistics only if showStats
  let statistiques = {
    beneficiairesAccompagnes: 0,
    accompagnements: 0,
  }

  if (!!coordinationFeatures && coordinationFeatures.showStats && mediateurId) {
    const { beneficiaires, accompagnements } = await getTotalCountsStats({
      user: sessionUser,
      mediateurIds: [mediateurId],
      activitesFilters: activitesFiltersLastDays(30),
    })
    statistiques = {
      beneficiairesAccompagnes: beneficiaires.total,
      accompagnements: accompagnements.total,
    }
  }

  const emploi = await getActeurEmploiForDate({
    userId,
    date: new Date(),
    strictDateBounds: true,
  })

  const lieuxActivites = mediateurId
    ? await prismaClient.structure.findMany({
        where: {
          mediateursEnActivite: {
            some: {
              mediateurId,
              suppression: null,
              fin: null,
            },
          },
        },
        select: lieuxForListSelect,
      })
    : []

  const activityDates = await getLastUserActivityDate({
    userId,
  })

  return {
    acteur,
    activityDates,
    mediateurId,
    acteurRole,
    emploi,
    lieuxActivites,
    retourHref,
    retourLabel,
    coordinationFeatures,
    conseillerNumerique,
    statistiques,
    contract,
  }
}

export type ActeurDetailPageData = NonNullable<
  Awaited<ReturnType<typeof getActeurDetailPageData>>
>
