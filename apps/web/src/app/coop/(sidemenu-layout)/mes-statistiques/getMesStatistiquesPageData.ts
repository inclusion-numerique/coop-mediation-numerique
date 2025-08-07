import {
  getAccompagnementsCountByDay,
  getAccompagnementsCountByMonth,
} from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getAccompagnementsCountByPeriod'
import {
  getActivitesStats,
  getActivitesStructuresStats,
} from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getActivitesStats'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { UserDisplayName, UserProfile } from '@app/web/utils/user'
import { getBeneficiaireStatsWithCommunes } from './_queries/getBeneficiaireStats'
import { getTotalCountsStats } from './_queries/getTotalCountsStats'

export type MesStatistiquesGraphOptions = {
  fin?: Date
  debut?: Date
}

const toMediateurId = ({ mediateurId }: { mediateurId: string }) => mediateurId

export const getMesStatistiquesPageData = async ({
  user,
  activitesFilters,
  graphOptions = {},
}: {
  user: UserDisplayName & UserProfile
  activitesFilters: ActivitesFilters
  graphOptions?: MesStatistiquesGraphOptions
}) => {
  const mediateurCoordonnes =
    user.coordinateur == null
      ? []
      : await prismaClient.mediateurCoordonne.findMany({
          where: { coordinateurId: user.coordinateur.id },
          select: { mediateurId: true },
        })
  const mediateurCoordonnesIds = mediateurCoordonnes.map(toMediateurId)

  const mediateurIds = [
    ...(user.mediateur?.id ? [user.mediateur.id] : []),
    ...(mediateurCoordonnesIds ?? []),
  ]

  if (!graphOptions.debut) {
    const filterStart = activitesFilters.du ?? undefined
    graphOptions.debut = filterStart ? new Date(filterStart) : undefined
  }

  if (!graphOptions.fin) {
    const filterEnd = activitesFilters.au ? activitesFilters.au : undefined

    // end of graph defaults to now
    graphOptions.fin = filterEnd ? new Date(filterEnd) : new Date()
  }

  const [
    accompagnementsParJour,
    accompagnementsParMois,
    beneficiaires,
    activites,
    structures,
    totalCounts,
  ] = await Promise.all([
    getAccompagnementsCountByDay({
      user,
      mediateurIds,
      activitesFilters,
      periodStart: graphOptions.debut
        ? dateAsIsoDay(graphOptions.debut)
        : undefined,
      periodEnd: graphOptions.fin ? dateAsIsoDay(graphOptions.fin) : undefined,
    }),
    getAccompagnementsCountByMonth({
      user,
      mediateurIds,
      activitesFilters,
      periodStart: graphOptions.debut
        ? dateAsIsoDay(graphOptions.debut)
        : undefined,
      periodEnd: graphOptions.fin ? dateAsIsoDay(graphOptions.fin) : undefined,
    }),
    getBeneficiaireStatsWithCommunes({ user, mediateurIds, activitesFilters }),
    getActivitesStats({ user, mediateurIds, activitesFilters }),
    getActivitesStructuresStats({ user, mediateurIds, activitesFilters }),
    getTotalCountsStats({ user, mediateurIds, activitesFilters }),
  ])

  const {
    communesOptions,
    departementsOptions,
    tagsOptions,
    initialMediateursOptions,
    initialBeneficiairesOptions,
    lieuxActiviteOptions,
    activiteDates,
  } = await getFiltersOptionsForMediateur({
    user,
    mediateurCoordonnesIds,
    includeBeneficiaireIds: activitesFilters.beneficiaires,
  })

  return {
    totalCounts,
    accompagnementsParMois,
    accompagnementsParJour,
    beneficiaires,
    activites,
    structures,
    activitesFilters,
    communesOptions,
    departementsOptions,
    tagsOptions,
    initialMediateursOptions,
    initialBeneficiairesOptions,
    lieuxActiviteOptions,
    activiteDates,
  }
}

export type MesStatistiquesPageData = Awaited<
  ReturnType<typeof getMesStatistiquesPageData>
>
