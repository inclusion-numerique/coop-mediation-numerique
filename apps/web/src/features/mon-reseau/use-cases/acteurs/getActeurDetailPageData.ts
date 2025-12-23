import { getTotalCountsStats } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getTotalCountsStats'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { getContractInfo } from '@app/web/conseiller-numerique/getContractInfo'
import { findConseillerNumeriqueV1 } from '@app/web/external-apis/conseiller-numerique/searchConseillerNumeriqueV1'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { getLieuxActivite } from '@app/web/features/lieux-activite/getLieuxActivite'
import { prismaClient } from '@app/web/prismaClient'
import { getStructureEmployeuseAddress } from '@app/web/structure/getStructureEmployeuseAddress'

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
}: {
  userId: string
  retourHref: string
  retourLabel: string
}) => {
  const authenticatedUser = await authenticateUser()
  const sessionUserCoordinateurId = authenticatedUser.coordinateur?.id

  // Fetch user with mediateur and coordinateur relations
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
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

  if (user == null) return null

  const mediateurId = user.mediateur?.id ?? null

  // Determine acteur role
  const acteurRole = user.coordinateur
    ? 'coordinateur'
    : user.mediateur?.conseillerNumerique
      ? 'conseiller_numerique'
      : user.mediateur
        ? 'mediateur'
        : null

  // Check if acteur's mediateur is in session user's team
  let isActeurInSessionUserTeam = false
  let coordinationEnd: Date | undefined

  if (mediateurId && sessionUserCoordinateurId) {
    const coordination = await prismaClient.mediateurCoordonne.findFirst({
      where: {
        mediateurId,
        coordinateurId: sessionUserCoordinateurId,
      },
      select: { suppression: true },
    })
    // Acteur is in team if coordination exists (even if ended for anciens membres)
    isActeurInSessionUserTeam = coordination != null
    coordinationEnd = coordination?.suppression ?? undefined
  }

  // Compute view mode flags
  const isSessionUserCoordinateur = sessionUserCoordinateurId != null
  const showTeamView = isSessionUserCoordinateur && isActeurInSessionUserTeam
  const showStats = showTeamView && mediateurId != null
  const showContract =
    showTeamView && user.mediateur?.conseillerNumerique != null
  const showReferentStructure = showTeamView
  const showTeamActions = showTeamView && coordinationEnd == null // Only show for active members

  // Fetch conseiller numerique idPg if needed
  const conseillerNumerique = user.mediateur?.conseillerNumerique ?? null
  if (conseillerNumerique != null && conseillerNumerique.idPg == null) {
    const conumV1 = await findConseillerNumeriqueV1({
      id: conseillerNumerique.id,
      includeDeleted: true,
    })
    conseillerNumerique.idPg = conumV1?.conseiller.idPG ?? null
  }

  const contract = showContract ? await getContractInfo(user.email) : null

  // Get statistics only if showStats
  let statistiques = {
    beneficiairesAccompagnes: 0,
    accompagnements: 0,
  }

  if (showStats && mediateurId) {
    const { beneficiaires, accompagnements } = await getTotalCountsStats({
      user: authenticatedUser,
      mediateurIds: [mediateurId],
      activitesFilters: activitesFiltersLastDays(30),
    })
    statistiques = {
      beneficiairesAccompagnes: beneficiaires.total,
      accompagnements: accompagnements.total,
    }
  }

  const structureEmployeuse = await getStructureEmployeuseAddress(userId)

  const lieuxActivites = mediateurId ? await getLieuxActivite(mediateurId) : []

  // Get count of coordinated mediateurs if acteur is a coordinateur
  const mediateursCoordonnésCount =
    user.coordinateur?._count.mediateursCoordonnes ?? 0

  return {
    userId: user.id,
    mediateurId,
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      created: user.created,
    },
    acteurRole,
    conseillerNumerique,
    statistiques,
    contract,
    structureEmployeuse,
    lieuxActivites,
    mediateursCoordonnésCount,
    retourHref,
    retourLabel,
    coordinationEnd,
    // View mode flags
    showTeamView,
    showStats,
    showContract,
    showReferentStructure,
    showTeamActions,
  }
}

export type ActeurDetailPageData = NonNullable<
  Awaited<ReturnType<typeof getActeurDetailPageData>>
>
