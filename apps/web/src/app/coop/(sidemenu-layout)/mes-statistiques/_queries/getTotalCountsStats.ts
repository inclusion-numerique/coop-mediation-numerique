import { activitesMediateurIdsWhereCondition } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/activitesMediateurIdsWhereCondition'
import { allocatePercentages } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/allocatePercentages'
import {
  getActiviteFiltersSqlFragment,
  getActivitesFiltersWhereConditions,
} from '@app/web/features/activites/use-cases/list/db/activitesFiltersSqlWhereConditions'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'
import type { UserProfile } from '@app/web/utils/user'

export type AccompagnementsStats = {
  activites: {
    total: number
    individuels: {
      total: number
      proportion: number
    }
    collectifs: {
      total: number
      proportion: number
      participants: number
    }
  }
  accompagnements: {
    total: number
    individuels: {
      total: number
      proportion: number
    }
    collectifs: {
      total: number
      proportion: number
    }
  }
  beneficiaires: {
    total: number
    nouveaux: number
    suivis: number
    anonymes: number
  }
}

const EMPTY_COUNT_STATS = {
  activites: {
    total: 0,
    individuels: { total: 0, proportion: 0 },
    collectifs: { total: 0, proportion: 0, participants: 0 },
  },
  accompagnements: {
    total: 0,
    individuels: { total: 0, proportion: 0 },
    collectifs: { total: 0, proportion: 0 },
  },
  beneficiaires: { total: 0, nouveaux: 0, anonymes: 0, suivis: 0 },
}

export const getTotalCountsStats = async ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user?: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
}): Promise<AccompagnementsStats> => {
  if (mediateurIds?.length === 0) return EMPTY_COUNT_STATS

  return prismaClient.$queryRaw<
    [
      {
        total_activites: number
        total_individuels: number
        total_collectifs: number
        total_beneficiaires: number
        total_accompagnements_nouveaux: number
        total_beneficiaires_suivis: number
        total_accompagnements: number
        total_accompagnements_collectifs: number
      },
    ]
  >`
      SELECT
        COUNT(DISTINCT act.id)::integer AS total_activites,
        COUNT(DISTINCT CASE WHEN act.type = 'individuel' THEN act.id END)::integer AS total_individuels,
        COUNT(DISTINCT CASE WHEN act.type = 'collectif' THEN act.id END)::integer AS total_collectifs,
        COUNT(DISTINCT ben.id)::integer AS total_beneficiaires,
        COUNT(DISTINCT CASE WHEN ben.anonyme = false THEN ben.id END)::integer AS total_beneficiaires_suivis,
        COUNT(DISTINCT CASE WHEN acc.premier_accompagnement = true
                AND ${activitesFilters.du}::timestamp IS NOT NULL
                AND ${activitesFilters.au}::timestamp IS NOT NULL
              THEN acc.id END)::integer AS total_accompagnements_nouveaux,
        COUNT(DISTINCT acc.id)::integer AS total_accompagnements,
        COUNT(DISTINCT CASE WHEN act.type = 'collectif' THEN acc.id END) ::integer AS total_accompagnements_collectifs
    FROM activites act
         FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${
           user?.coordinateur?.id
         }::UUID
         LEFT JOIN accompagnements acc ON acc.activite_id = act.id
         LEFT JOIN beneficiaires ben ON ben.id = acc.beneficiaire_id
         LEFT JOIN structures str ON str.id = act.structure_id
         LEFT JOIN mediateurs med ON act.mediateur_id = med.id
         LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id
    WHERE ${activitesMediateurIdsWhereCondition(mediateurIds)}
    AND act.suppression IS NULL
    AND (act.date <= mc.suppression OR mc.suppression IS NULL)
    AND ${getActiviteFiltersSqlFragment(
      getActivitesFiltersWhereConditions(activitesFilters),
    )}
  `.then(([result]) => {
    const [proportionActivitesIndividuels, proportionActivitesCollectifs] =
      allocatePercentages([result.total_individuels, result.total_collectifs])

    const [
      proportionAccompagnementsIndividuels,
      proportionAccompagnementsCollectifs,
    ] = allocatePercentages([
      result.total_individuels, // Pour individuel, le nb d’accompagnements = nb d’activités
      result.total_accompagnements_collectifs,
    ])

    return {
      activites: {
        total: result.total_activites,
        individuels: {
          total: result.total_individuels,
          proportion: proportionActivitesIndividuels,
        },
        collectifs: {
          total: result.total_collectifs,
          proportion: proportionActivitesCollectifs,
          participants: result.total_accompagnements_collectifs,
        },
      },
      accompagnements: {
        total: result.total_accompagnements,
        individuels: {
          total: result.total_individuels,
          proportion: proportionAccompagnementsIndividuels,
        },
        collectifs: {
          total: result.total_accompagnements_collectifs,
          proportion: proportionAccompagnementsCollectifs,
        },
      },
      beneficiaires: {
        total: result.total_beneficiaires,
        nouveaux: result.total_accompagnements_nouveaux,
        suivis: result.total_beneficiaires_suivis,
        anonymes:
          result.total_beneficiaires - result.total_beneficiaires_suivis,
      },
    }
  })
}

export type TotalCountsStats = Awaited<ReturnType<typeof getTotalCountsStats>>
