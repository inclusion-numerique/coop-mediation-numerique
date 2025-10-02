import { activitesMediateurIdsWhereCondition } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/activitesMediateurIdsWhereCondition'
import { allocatePercentagesFromRecords } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/allocatePercentages'
import { createEnumCountSelect } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/createEnumCountSelect'
import {
  genreLabels,
  genreValues,
  statutSocialLabels,
  statutSocialValues,
  trancheAgeLabels,
  trancheAgeValues,
} from '@app/web/beneficiaire/beneficiaire'
import {
  getActiviteFiltersSqlFragment,
  getActivitesFiltersWhereConditions,
} from '@app/web/features/activites/use-cases/list/db/activitesFiltersSqlWhereConditions'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'
import { UserProfile } from '@app/web/utils/user'
import { Genre, StatutSocial, TrancheAge } from '@prisma/client'
import { snakeCase } from 'change-case'
import { activitesSourceWhereCondition } from './activitesSourceWhereCondition'

export type BeneficiairesStatsRaw = {
  total_beneficiaires: number
  [key: `genre_${string}`]: number
  [key: `tranche_age_${string}`]: number
  [key: `statut_social_${string}`]: number
}

const EMPTY_BENEFICIAIRES_STATS = { total_beneficiaires: 0 }

export const getBeneficiaireStatsRaw = async ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user?: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
}) => {
  if (mediateurIds?.length === 0) return EMPTY_BENEFICIAIRES_STATS

  return prismaClient.$queryRaw<[BeneficiairesStatsRaw]>`
      WITH distinct_beneficiaires AS (
        SELECT DISTINCT
          ben.id,
          ben.genre,
          ben.statut_social,
          ben.tranche_age,
          ben.commune,
          ben.commune_code_postal,
          ben.commune_code_insee
        FROM beneficiaires ben
          INNER JOIN accompagnements acc ON acc.beneficiaire_id = ben.id
          INNER JOIN activites act ON act.id = acc.activite_id
          FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${
            user?.coordinateur?.id
          }::UUID
          LEFT JOIN mediateurs med ON act.mediateur_id = med.id
          LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id
          LEFT JOIN structures str ON str.id = act.structure_id
          WHERE (act.date <= mc.suppression OR mc.suppression IS NULL)
            AND act.suppression IS NULL
            AND ${activitesMediateurIdsWhereCondition(mediateurIds)}
            AND ${activitesSourceWhereCondition(activitesFilters.source)}
            AND ${getActiviteFiltersSqlFragment(
              getActivitesFiltersWhereConditions(activitesFilters),
            )})
      
      SELECT COUNT(distinct_beneficiaires.id)::integer AS total_beneficiaires,

             -- Enum count selects for genre, statut_social, tranche_age
             ${createEnumCountSelect({
               enumObj: Genre,
               column: 'distinct_beneficiaires.genre',
               as: 'genre',
               defaultEnumValue: Genre.NonCommunique,
             })},
             ${createEnumCountSelect({
               enumObj: StatutSocial,
               column: 'distinct_beneficiaires.statut_social',
               as: 'statut_social',
               defaultEnumValue: StatutSocial.NonCommunique,
             })},
             ${createEnumCountSelect({
               enumObj: TrancheAge,
               column: 'distinct_beneficiaires.tranche_age',
               as: 'tranche_age',
               defaultEnumValue: TrancheAge.NonCommunique,
             })}
      FROM distinct_beneficiaires`.then((result) => result[0])
}

export const normalizeBeneficiairesStatsRaw = (
  stats: BeneficiairesStatsRaw,
) => {
  const genresData = genreValues.map((genre) => ({
    value: genre,
    label: genreLabels[genre],
    count: stats[`genre_${snakeCase(genre)}_count`],
  }))

  const trancheAgesData = trancheAgeValues.map((trancheAge) => ({
    value: trancheAge,
    label: trancheAgeLabels[trancheAge],
    count: stats[`tranche_age_${snakeCase(trancheAge)}_count`],
  }))

  const statutsSocialData = statutSocialValues.map((statutSocial) => ({
    value: statutSocial,
    label: statutSocialLabels[statutSocial],
    count: stats[`statut_social_${snakeCase(statutSocial)}_count`],
  }))

  return {
    total: stats.total_beneficiaires,
    genres: allocatePercentagesFromRecords(genresData, 'count', 'proportion'),
    trancheAges: allocatePercentagesFromRecords(
      trancheAgesData,
      'count',
      'proportion',
    ),
    statutsSocial: allocatePercentagesFromRecords(
      statutsSocialData,
      'count',
      'proportion',
    ),
  }
}

export type BeneficiairesCommunesRaw = {
  commune: string | null
  code_postal: string | null
  code_insee: string | null
  count_beneficiaires: number
}

export const getBeneficiairesCommunesRaw = async ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
}) => {
  if (mediateurIds?.length === 0) return []

  return prismaClient.$queryRaw<BeneficiairesCommunesRaw[]>`
      SELECT DISTINCT
        MIN(ben.commune_code_insee) AS code_insee,
        MIN(ben.commune) AS commune,
        MIN(ben.commune_code_postal) AS code_postal,
        COUNT(DISTINCT ben.id) ::integer AS count_beneficiaires
      FROM beneficiaires ben
        INNER JOIN accompagnements acc ON acc.beneficiaire_id = ben.id
        INNER JOIN activites act ON  act.id = acc.activite_id
          AND ${activitesMediateurIdsWhereCondition(mediateurIds)}
          AND ${activitesSourceWhereCondition(activitesFilters.source)}
          AND act.suppression IS NULL
            LEFT JOIN structures str ON str.id = act.structure_id
            LEFT JOIN mediateurs med ON act.mediateur_id = med.id
            LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id
            FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${
              user.coordinateur?.id
            }::UUID
        WHERE (act.date <= mc.suppression OR mc.suppression IS NULL)
          AND ${getActiviteFiltersSqlFragment(
            getActivitesFiltersWhereConditions(activitesFilters),
          )}
      GROUP BY commune_code_insee
  `
}

export const normalizeBeneficiairesCommunesRaw = (
  rawCommunes: BeneficiairesCommunesRaw[],
) => {
  const sortedCommunes = rawCommunes.sort(
    (a, b) => b.count_beneficiaires - a.count_beneficiaires,
  )
  const normalizedCommunes = sortedCommunes.map(
    ({ commune, code_insee, code_postal, count_beneficiaires }) => ({
      nom: commune,
      codeInsee: code_insee,
      codePostal: code_postal,
      count: count_beneficiaires,
      label:
        commune && code_postal
          ? `${commune} · ${code_postal}`
          : 'Non communiqué',
    }),
  )

  return allocatePercentagesFromRecords(
    normalizedCommunes,
    'count',
    'proportion',
  )
}

export const getBeneficiaireStats = async ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user?: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
}) => {
  const statsRaw = await getBeneficiaireStatsRaw({
    user,
    mediateurIds,
    activitesFilters,
  })

  return normalizeBeneficiairesStatsRaw(statsRaw)
}

export type BeneficiaireStats = Awaited<ReturnType<typeof getBeneficiaireStats>>

export const getBeneficiaireStatsWithCommunes = async ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
}) => {
  const beneficiairesStats = await getBeneficiaireStats({
    user,
    mediateurIds,
    activitesFilters,
  })

  const rawCommunes = await getBeneficiairesCommunesRaw({
    user,
    mediateurIds,
    activitesFilters,
  })

  return {
    ...beneficiairesStats,
    communes: normalizeBeneficiairesCommunesRaw(rawCommunes),
  }
}

export type BeneficiairesStatsWithCommunes = Awaited<
  ReturnType<typeof getBeneficiaireStatsWithCommunes>
>
