import { activitesMediateurIdsWhereCondition } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/activitesMediateurIdsWhereCondition'
import { allocatePercentages } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/allocatePercentages'
import {
  getActiviteFiltersSqlFragment,
  getActivitesFiltersWhereConditions,
} from '@app/web/features/activites/use-cases/list/db/activitesFiltersSqlWhereConditions'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'
import type { UserProfile } from '@app/web/utils/user'
import { Prisma } from '@prisma/client'

/**
 * Determines which JOINs are needed based on filter values:
 * - conseiller_numerique filter requires mediateurs + conseillers_numeriques tables
 * - communes/departements filters require structures table
 */
const getRequiredJoins = (activitesFilters: ActivitesFilters) => ({
  needsConseillerNumeriqueJoin: !!activitesFilters.conseiller_numerique,
  needsStructureJoin:
    (activitesFilters.communes?.length ?? 0) > 0 ||
    (activitesFilters.departements?.length ?? 0) > 0,
})

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

type ActivityStatsResult = {
  total_activites: number
  total_individuels: number
  total_collectifs: number
  total_accompagnements: number
  total_accompagnements_collectifs: number
}

type BeneficiaireStatsResult = {
  total_beneficiaires: number
  total_beneficiaires_suivis: number
}

type NouveauxCountResult = {
  total_accompagnements_nouveaux: number
}

/**
 * Counts activites and accompagnements using pre-computed accompagnements_count column.
 * JOINs are conditional based on which filters are actually used.
 */
const getActivityStatsQuery = ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user?: UserProfile
  mediateurIds?: string[]
  activitesFilters: ActivitesFilters
}) => {
  const hasCoordinateurContext = !!user?.coordinateur?.id
  const { needsConseillerNumeriqueJoin, needsStructureJoin } =
    getRequiredJoins(activitesFilters)

  return prismaClient.$queryRaw<[ActivityStatsResult]>`
    SELECT
      COUNT(*)::integer AS total_activites,
      SUM(CASE WHEN act.type = 'individuel' THEN 1 ELSE 0 END)::integer AS total_individuels,
      SUM(CASE WHEN act.type = 'collectif' THEN 1 ELSE 0 END)::integer AS total_collectifs,
      COALESCE(SUM(act.accompagnements_count), 0)::integer AS total_accompagnements,
      SUM(CASE WHEN act.type = 'collectif' THEN act.accompagnements_count ELSE 0 END)::integer AS total_accompagnements_collectifs
    FROM activites act
      ${
        hasCoordinateurContext
          ? Prisma.sql`FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${user?.coordinateur?.id}::UUID`
          : Prisma.empty
      }
      ${needsStructureJoin ? Prisma.sql`LEFT JOIN structures str ON str.id = act.structure_id` : Prisma.empty}
      ${needsConseillerNumeriqueJoin ? Prisma.sql`LEFT JOIN mediateurs med ON act.mediateur_id = med.id` : Prisma.empty}
      ${needsConseillerNumeriqueJoin ? Prisma.sql`LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id` : Prisma.empty}
    WHERE ${activitesMediateurIdsWhereCondition(mediateurIds)}
      AND act.suppression IS NULL
      ${
        hasCoordinateurContext
          ? Prisma.sql`AND (act.date <= mc.suppression OR mc.suppression IS NULL)`
          : Prisma.empty
      }
      AND ${getActiviteFiltersSqlFragment(
        getActivitesFiltersWhereConditions(activitesFilters),
      )}
  `.then((result) => result[0])
}

/**
 * Counts distinct beneficiaires (total and followed/non-anonymous).
 * JOINs are conditional based on which filters are actually used.
 */
const getBeneficiaireStatsQuery = ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user?: UserProfile
  mediateurIds?: string[]
  activitesFilters: ActivitesFilters
}) => {
  const hasCoordinateurContext = !!user?.coordinateur?.id
  const { needsConseillerNumeriqueJoin, needsStructureJoin } =
    getRequiredJoins(activitesFilters)

  return prismaClient.$queryRaw<[BeneficiaireStatsResult]>`
    SELECT
      COUNT(DISTINCT ben.id)::integer AS total_beneficiaires,
      COUNT(DISTINCT CASE WHEN ben.anonyme = false THEN ben.id END)::integer AS total_beneficiaires_suivis
    FROM activites act
      ${
        hasCoordinateurContext
          ? Prisma.sql`FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${user?.coordinateur?.id}::UUID`
          : Prisma.empty
      }
      INNER JOIN accompagnements acc ON acc.activite_id = act.id
      INNER JOIN beneficiaires ben ON ben.id = acc.beneficiaire_id
      ${needsStructureJoin ? Prisma.sql`LEFT JOIN structures str ON str.id = act.structure_id` : Prisma.empty}
      ${needsConseillerNumeriqueJoin ? Prisma.sql`LEFT JOIN mediateurs med ON act.mediateur_id = med.id` : Prisma.empty}
      ${needsConseillerNumeriqueJoin ? Prisma.sql`LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id` : Prisma.empty}
    WHERE ${activitesMediateurIdsWhereCondition(mediateurIds)}
      AND act.suppression IS NULL
      ${
        hasCoordinateurContext
          ? Prisma.sql`AND (act.date <= mc.suppression OR mc.suppression IS NULL)`
          : Prisma.empty
      }
      AND ${getActiviteFiltersSqlFragment(
        getActivitesFiltersWhereConditions(activitesFilters),
      )}
  `.then((result) => result[0])
}

/**
 * Counts new accompagnements (premier_accompagnement = true).
 * Only runs when date filters (du/au) are provided, otherwise returns 0.
 */
const getNouveauxAccompagnementsQuery = ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user?: UserProfile
  mediateurIds?: string[]
  activitesFilters: ActivitesFilters
}): Promise<NouveauxCountResult> => {
  // Only count "nouveaux" when date filters are provided
  if (!activitesFilters.du || !activitesFilters.au) {
    return Promise.resolve({ total_accompagnements_nouveaux: 0 })
  }

  const hasCoordinateurContext = !!user?.coordinateur?.id
  const { needsConseillerNumeriqueJoin, needsStructureJoin } =
    getRequiredJoins(activitesFilters)

  return prismaClient.$queryRaw<[NouveauxCountResult]>`
    SELECT
      COUNT(*)::integer AS total_accompagnements_nouveaux
    FROM accompagnements acc
      INNER JOIN activites act ON acc.activite_id = act.id
      ${
        hasCoordinateurContext
          ? Prisma.sql`FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${user?.coordinateur?.id}::UUID`
          : Prisma.empty
      }
      ${needsStructureJoin ? Prisma.sql`LEFT JOIN structures str ON str.id = act.structure_id` : Prisma.empty}
      ${needsConseillerNumeriqueJoin ? Prisma.sql`LEFT JOIN mediateurs med ON act.mediateur_id = med.id` : Prisma.empty}
      ${needsConseillerNumeriqueJoin ? Prisma.sql`LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id` : Prisma.empty}
    WHERE acc.premier_accompagnement = true
      AND ${activitesMediateurIdsWhereCondition(mediateurIds)}
      AND act.suppression IS NULL
      ${
        hasCoordinateurContext
          ? Prisma.sql`AND (act.date <= mc.suppression OR mc.suppression IS NULL)`
          : Prisma.empty
      }
      AND ${getActiviteFiltersSqlFragment(
        getActivitesFiltersWhereConditions(activitesFilters),
      )}
  `.then((result) => result[0])
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

  // Parallel queries: activity counts, beneficiaire counts, new accompagnements count
  const [activityStats, beneficiaireStats, nouveauxCount] = await Promise.all([
    getActivityStatsQuery({ user, mediateurIds, activitesFilters }),
    getBeneficiaireStatsQuery({ user, mediateurIds, activitesFilters }),
    getNouveauxAccompagnementsQuery({ user, mediateurIds, activitesFilters }),
  ])

  const [proportionActivitesIndividuels, proportionActivitesCollectifs] =
    allocatePercentages([
      activityStats.total_individuels,
      activityStats.total_collectifs,
    ])

  const [
    proportionAccompagnementsIndividuels,
    proportionAccompagnementsCollectifs,
  ] = allocatePercentages([
    activityStats.total_individuels, // Pour individuel, le nb d'accompagnements = nb d'activités
    activityStats.total_accompagnements_collectifs,
  ])

  return {
    activites: {
      total: activityStats.total_activites,
      individuels: {
        total: activityStats.total_individuels,
        proportion: proportionActivitesIndividuels,
      },
      collectifs: {
        total: activityStats.total_collectifs,
        proportion: proportionActivitesCollectifs,
        participants: activityStats.total_accompagnements_collectifs,
      },
    },
    accompagnements: {
      total: activityStats.total_accompagnements,
      individuels: {
        total: activityStats.total_individuels,
        proportion: proportionAccompagnementsIndividuels,
      },
      collectifs: {
        total: activityStats.total_collectifs,
        proportion: proportionAccompagnementsCollectifs,
      },
    },
    beneficiaires: {
      total: beneficiaireStats.total_beneficiaires,
      nouveaux: nouveauxCount.total_accompagnements_nouveaux,
      suivis: beneficiaireStats.total_beneficiaires_suivis,
      anonymes:
        beneficiaireStats.total_beneficiaires -
        beneficiaireStats.total_beneficiaires_suivis,
    },
  }
}

export type TotalCountsStats = Awaited<ReturnType<typeof getTotalCountsStats>>
