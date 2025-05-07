import { activitesMediateurIdsWhereCondition } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/activitesMediateurIdsWhereCondition'
import { allocatePercentagesFromRecords } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/allocatePercentages'
import {
  createDureesRangesSelect,
  createEnumArrayCountSelect,
  createEnumCountSelect,
} from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/createEnumCountSelect'
import { dureeAccompagnementStatisticsRanges } from '@app/web/features/activites/use-cases/cra/fields/duree-accompagnement'
import {
  materielLabels,
  materielValues,
} from '@app/web/features/activites/use-cases/cra/fields/materiel'
import {
  thematiqueLabels,
  thematiquesAdministrativesValues,
  thematiquesNonAdministrativesValues,
} from '@app/web/features/activites/use-cases/cra/fields/thematique'
import {
  typeActiviteLabels,
  typeActiviteValues,
} from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import {
  typeLieuLabels,
  typeLieuValues,
} from '@app/web/features/activites/use-cases/cra/fields/type-lieu'
import {
  getActiviteFiltersSqlFragment,
  getActivitesFiltersWhereConditions,
} from '@app/web/features/activites/use-cases/list/db/activitesFiltersSqlWhereConditions'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'
import { UserProfile } from '@app/web/utils/user'
import { Materiel, Thematique, TypeActivite, TypeLieu } from '@prisma/client'
import { snakeCase } from 'change-case'

export type ActivitesStatsRaw = {
  total_activites: number
  [key: `type_${string}_count`]: number
  [key: `duree_${string}_count`]: number
  [key: `type_lieu_${string}_count`]: number
  [key: `thematiques_${string}_count`]: number
  [key: `materiel_${string}_count`]: number
}

const EMPTY_ACTIVITES_STATS: ActivitesStatsRaw = { total_activites: 0 }

export const getActivitesStatsRaw = async ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user?: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
}) => {
  if (mediateurIds?.length === 0) return EMPTY_ACTIVITES_STATS

  return prismaClient.$queryRaw<[ActivitesStatsRaw]>`
      SELECT COALESCE(COUNT(*), 0)::integer AS total_activites,
        -- Enum count selects for type, type_lieu, duree, thematiques, materiel
        ${createEnumCountSelect({
          enumObj: TypeActivite,
          column: 'act.type',
          as: 'type',
        })},
        ${createDureesRangesSelect({ column: 'act.duree', as: 'duree' })},
        ${createEnumCountSelect({
          enumObj: TypeLieu,
          column: 'act.type_lieu',
          as: 'type_lieu',
        })},
        ${createEnumArrayCountSelect({
          enumObj: Thematique,
          column: 'act.thematiques',
          as: 'thematiques',
        })},
        ${createEnumArrayCountSelect({
          enumObj: Materiel,
          column: 'act.materiel',
          as: 'materiel',
        })}
      FROM activites act
        LEFT JOIN structures str ON str.id = act.structure_id
        LEFT JOIN mediateurs med ON act.mediateur_id = med.id
        LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id
        FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${
          user?.coordinateur?.id
        }::UUID
      WHERE ${activitesMediateurIdsWhereCondition(mediateurIds)}
        AND (act.date <= mc.suppression OR mc.suppression IS NULL)
        AND act.suppression IS NULL
        AND ${getActiviteFiltersSqlFragment(
          getActivitesFiltersWhereConditions(activitesFilters),
        )}
  `.then((result) => result[0])
}

export const normalizeActivitesStatsRaw = (stats: ActivitesStatsRaw) => {
  const typeActivitesData = typeActiviteValues.map((typeActivite) => ({
    value: typeActivite,
    label: typeActiviteLabels[typeActivite],
    count: stats[`type_${snakeCase(typeActivite)}_count`] ?? 0,
  }))

  const dureesData = dureeAccompagnementStatisticsRanges.map(
    ({ key, label }) => ({
      value: key,
      label,
      count: stats[`duree_${key}_count`] ?? 0,
    }),
  )

  const typeLieuData = typeLieuValues.map((typeLieu) => ({
    value: typeLieu,
    label: typeLieuLabels[typeLieu],
    count: stats[`type_lieu_${snakeCase(typeLieu)}_count`] ?? 0,
  }))

  const thematiquesData = thematiquesNonAdministrativesValues.map(
    (thematique) => ({
      value: thematique,
      label: thematiqueLabels[thematique],
      count: stats[`thematiques_${snakeCase(thematique)}_count`] ?? 0,
    }),
  )

  const thematiquesDemarchesData = thematiquesAdministrativesValues.map(
    (thematiqueAdministrative) => ({
      value: thematiqueAdministrative,
      label: thematiqueLabels[thematiqueAdministrative],
      count:
        stats[`thematiques_${snakeCase(thematiqueAdministrative)}_count`] ?? 0,
    }),
  )

  const materielsData = materielValues.map((materiel) => ({
    value: materiel,
    label: materielLabels[materiel],
    count: stats[`materiel_${snakeCase(materiel)}_count`] ?? 0,
  }))

  return {
    total: stats.total_activites,
    typeActivites: allocatePercentagesFromRecords(
      typeActivitesData,
      'count',
      'proportion',
    ),
    durees: allocatePercentagesFromRecords(dureesData, 'count', 'proportion'),
    typeLieu: allocatePercentagesFromRecords(
      typeLieuData,
      'count',
      'proportion',
    ),
    thematiques: allocatePercentagesFromRecords(
      thematiquesData,
      'count',
      'proportion',
    ),
    thematiquesDemarches: allocatePercentagesFromRecords(
      thematiquesDemarchesData,
      'count',
      'proportion',
    ),
    materiels: allocatePercentagesFromRecords(
      materielsData,
      'count',
      'proportion',
    ),
  }
}

export const getActivitesStats = async ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user?: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
}) => {
  const statsRaw = await getActivitesStatsRaw({
    user,
    mediateurIds,
    activitesFilters,
  })

  return normalizeActivitesStatsRaw(statsRaw)
}

export type ActivitesStats = Awaited<ReturnType<typeof getActivitesStats>>

export type ActivitesStructuresStatsRaw = {
  id: string
  nom: string
  commune: string
  code_postal: string
  code_insee: string
  count: number
}

export const getActivitesStructuresStatsRaw = async ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
}) => {
  if (mediateurIds?.length === 0) return []

  return prismaClient.$queryRaw<ActivitesStructuresStatsRaw[]>`
    SELECT
      str.id,
      str.nom,
      str.commune,
      str.code_postal,
      str.code_insee,
      COALESCE(COUNT(*), 0) ::int AS count
    FROM structures str
      INNER JOIN activites act ON act.structure_id = str.id
      LEFT JOIN mediateurs med ON act.mediateur_id = med.id
      LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id
      FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${
        user?.coordinateur?.id
      }::UUID
      WHERE (act.date <= mc.suppression OR mc.suppression IS NULL)
        AND act.suppression IS NULL
        AND ${activitesMediateurIdsWhereCondition(mediateurIds)}
        AND ${getActiviteFiltersSqlFragment(
          getActivitesFiltersWhereConditions(activitesFilters),
        )}
    GROUP BY str.id`
}

export const getActivitesStructuresStats = async ({
  user,
  mediateurIds,
  activitesFilters,
}: {
  user: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
}) => {
  const statsRaw = await getActivitesStructuresStatsRaw({
    user,
    mediateurIds,
    activitesFilters,
  })
  const sortedStructures = statsRaw.sort((a, b) => b.count - a.count)
  const normalizedStructures = sortedStructures.map(
    ({ id, nom, commune, code_postal, code_insee, count }) => ({
      id,
      nom,
      commune,
      codePostal: code_postal,
      codeInsee: code_insee,
      count,
      label: nom,
    }),
  )

  return allocatePercentagesFromRecords(
    normalizedStructures,
    'count',
    'proportion',
  )
}

export type ActivitesStructuresStats = Awaited<
  ReturnType<typeof getActivitesStructuresStats>
>
