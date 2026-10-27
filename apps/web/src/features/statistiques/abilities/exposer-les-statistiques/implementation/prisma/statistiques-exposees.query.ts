import {
  getAccompagnementsCountByDay,
  getAccompagnementsCountByMonth,
} from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getAccompagnementsCountByPeriod'
import { getActivitesStats } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getActivitesStats'
import { getBeneficiaireStats } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getBeneficiaireStats'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { getTotalCountsStats } from '@app/web/features/statistiques/db/getTotalCountsStats'

export const statistiquesExposees = async (
  activitesFilters: ActivitesFilters,
) => {
  const [
    accompagnementsParJour,
    accompagnementsParMois,
    beneficiaires,
    activites,
    totaux,
  ] = await Promise.all([
    getAccompagnementsCountByDay({ activitesFilters }),
    getAccompagnementsCountByMonth({ activitesFilters }),
    getBeneficiaireStats({ activitesFilters }),
    getActivitesStats({ activitesFilters }),
    getTotalCountsStats({ activitesFilters }),
  ])

  return {
    accompagnementsParJour,
    accompagnementsParMois,
    beneficiaires,
    activites,
    totaux,
  }
}

export type StatistiquesExposees = Awaited<
  ReturnType<typeof statistiquesExposees>
>
