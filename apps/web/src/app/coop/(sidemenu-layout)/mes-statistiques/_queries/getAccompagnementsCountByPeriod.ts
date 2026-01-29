import { activitesMediateurIdsWhereCondition } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/activitesMediateurIdsWhereCondition'
import {
  getActiviteFiltersSqlFragment,
  getActivitesFiltersWhereConditions,
} from '@app/web/features/activites/use-cases/list/db/activitesFiltersSqlWhereConditions'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'
import {
  MonthShortLabel,
  monthShortLabels,
} from '@app/web/utils/monthShortLabels'
import { UserProfile } from '@app/web/utils/user'
import { Prisma } from '@prisma/client'
import { differenceInMonths } from 'date-fns'
import { LabelAndCount } from '../quantifiedShare'
import { activitesSourceWhereCondition } from './activitesSourceWhereCondition'

const EMPTY_ACCOMPAGNEMENTS_COUNT = monthShortLabels.map(
  (label: MonthShortLabel) => ({ label, count: 0 }),
)

const formatMonthLabel = (
  month: number,
  year: number,
  includeYear: boolean,
): string => {
  const monthLabel = monthShortLabels[month - 1]
  if (!includeYear) return monthLabel
  const shortYear = year.toString().slice(-2)
  return `${monthLabel} ${shortYear}`
}

export const getAccompagnementsCountByMonth = async ({
  user,
  mediateurIds,
  activitesFilters,
  periodStart,
  periodEnd,
  intervals = 12,
}: {
  user?: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
  periodStart?: string // Format should be 'YYYY-MM-DD'
  periodEnd?: string // Format should be 'YYYY-MM-DD', defaults to CURRENT_DATE if not provided
  intervals?: number // Default to 12 if not provided
}) => {
  if (mediateurIds?.length === 0) return EMPTY_ACCOMPAGNEMENTS_COUNT

  const hasCoordinateurContext = !!user?.coordinateur?.id

  // include dates until the end of the month if no default end date
  const endDate = periodEnd
    ? `TO_DATE('${periodEnd}', 'YYYY-MM-DD')`
    : `CURRENT_DATE`
  const fromDate = periodStart
    ? `TO_DATE('${periodStart}', 'YYYY-MM-DD')`
    : `DATE_TRUNC('month', ${endDate} - INTERVAL '${intervals - 1} months')`

  // Determine if we need to show year in labels (when period > 12 months)
  const startDateObj = periodStart
    ? new Date(periodStart)
    : new Date(new Date().setMonth(new Date().getMonth() - (intervals - 1)))
  const endDateObj = periodEnd ? new Date(periodEnd) : new Date()
  const includeYear = differenceInMonths(endDateObj, startDateObj) > 11

  return prismaClient.$queryRaw<
    { month: number; year: number; count: number }[]
  >`
      WITH filtered_accompagnements AS (
          SELECT act.date
          FROM activites act
            ${
              hasCoordinateurContext
                ? Prisma.sql`FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${user?.coordinateur?.id}::UUID`
                : Prisma.empty
            }
            INNER JOIN accompagnements acc ON acc.activite_id = act.id
            LEFT JOIN mediateurs med ON act.mediateur_id = med.id
            LEFT JOIN users u ON med.user_id = u.id
            LEFT JOIN structures str ON str.id = act.structure_id
          WHERE ${activitesMediateurIdsWhereCondition(mediateurIds)}
            AND ${activitesSourceWhereCondition(activitesFilters.source)}
            AND act.suppression IS NULL
            AND ${getActiviteFiltersSqlFragment(
              getActivitesFiltersWhereConditions(activitesFilters),
            )}
            AND act.date <= ${Prisma.raw(endDate)}
            AND act.date >= ${Prisma.raw(fromDate)}
            ${
              hasCoordinateurContext
                ? Prisma.sql`AND (act.date <= mc.suppression OR mc.suppression IS NULL)`
                : Prisma.empty
            }),
           months AS (SELECT DATE_TRUNC(
            'month',
            generate_series(
              ${Prisma.raw(fromDate)},
              ${Prisma.raw(endDate)},
              '1 month'::interval
              )
            ) AS month)
      SELECT EXTRACT(MONTH FROM months.month)::int     AS month,
             EXTRACT(YEAR FROM months.month)::int      AS year,
             COUNT(filtered_accompagnements.date)::int AS count
      FROM months
        LEFT JOIN filtered_accompagnements
          ON DATE_TRUNC('month', filtered_accompagnements.date) = months.month
      GROUP BY months.month
      ORDER BY months.month
  `.then((result) =>
    result.map(({ count, month, year }) => ({
      count,
      label: formatMonthLabel(month, year, includeYear),
    })),
  )
}

export const getAccompagnementsCountByDay = async ({
  user,
  mediateurIds,
  activitesFilters,
  periodStart,
  periodEnd,
  intervals = 30,
}: {
  user?: UserProfile
  mediateurIds?: string[] // Undefined means no filter, empty array means no mediateur / no data.
  activitesFilters: ActivitesFilters
  periodStart?: string // Format should be 'YYYY-MM-DD'
  periodEnd?: string // Format should be 'YYYY-MM-DD', defaults to CURRENT_DATE if not provided
  intervals?: number // Default to 30 if not provided
}) => {
  if (mediateurIds?.length === 0) return EMPTY_ACCOMPAGNEMENTS_COUNT

  const hasCoordinateurContext = !!user?.coordinateur?.id

  const start = periodStart ?? activitesFilters.du
  const end = periodEnd ?? activitesFilters.au

  const endDate = end ? `TO_DATE('${end}', 'YYYY-MM-DD')` : `CURRENT_DATE`
  const fromDate = start
    ? `TO_DATE('${start}', 'YYYY-MM-DD')`
    : `DATE_TRUNC('day', ${endDate} - INTERVAL '${intervals - 1} days')`

  return prismaClient.$queryRaw<LabelAndCount[]>`
      WITH filtered_accompagnements AS (
        SELECT act.date AS date
            FROM activites act
                ${
                  hasCoordinateurContext
                    ? Prisma.sql`FULL OUTER JOIN mediateurs_coordonnes mc ON mc.mediateur_id = act.mediateur_id AND mc.coordinateur_id = ${user?.coordinateur?.id}::UUID`
                    : Prisma.empty
                }
                INNER JOIN accompagnements ON accompagnements.activite_id = act.id
                LEFT JOIN mediateurs med ON act.mediateur_id = med.id
                LEFT JOIN users u ON med.user_id = u.id
                LEFT JOIN structures str ON str.id = act.structure_id
        WHERE ${activitesMediateurIdsWhereCondition(mediateurIds)}
          AND ${activitesSourceWhereCondition(activitesFilters.source)}
          AND act.suppression IS NULL
          AND ${getActiviteFiltersSqlFragment(
            getActivitesFiltersWhereConditions(activitesFilters),
          )}
          AND act.date <= ${Prisma.raw(endDate)}
          AND act.date >= ${Prisma.raw(fromDate)}
          ${
            hasCoordinateurContext
              ? Prisma.sql`AND (act.date <= mc.suppression OR mc.suppression IS NULL)`
              : Prisma.empty
          }),
           days AS (SELECT generate_series(${Prisma.raw(
             fromDate,
           )}, ${Prisma.raw(endDate)}, '1 day'::interval) AS date)

      SELECT TO_CHAR(days.date, 'DD/MM')               AS label,
             COUNT(filtered_accompagnements.date)::int AS count
      FROM days
               LEFT JOIN filtered_accompagnements
                         ON filtered_accompagnements.date = days.date
      GROUP BY days.date
      ORDER BY days.date
  `
}
