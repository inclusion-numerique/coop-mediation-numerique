import { prismaClient } from '@app/web/prismaClient'
import { monthShortLabels } from '@app/web/utils/monthShortLabels'
import { Prisma } from '@prisma/client'

type AccompagnementPerMonth = {
  byMediateurs: number
  byConseillers: number
  mois: string
}

const fromDate = `DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months')`

type CombinedQueryResult = {
  // Totals
  total_mediateurs: number
  total_conseillers: number
  total_count: number
  percentage_mediateurs: number
  percentage_conseillers: number
  // Monthly data (JSON arrays)
  monthly_data: {
    month: number
    bymediateurs: number
    byconseillers: number
  }[]
  // Initial counts before period
  initial_mediateurs: number
  initial_conseillers: number
}

export const getAccompagnements = async () => {
  const result = await prismaClient.$queryRaw<[CombinedQueryResult]>`
    WITH 
    -- Base data: all accompagnements with role
    base_accompagnements AS (
      SELECT 
        act.date,
        CASE WHEN u.is_conseiller_numerique THEN 'conseiller' ELSE 'mediateur' END AS role
      FROM activites act
        JOIN accompagnements acc ON acc.activite_id = act.id
        LEFT JOIN mediateurs med ON act.mediateur_id = med.id
        LEFT JOIN users u ON med.user_id = u.id
      WHERE act.suppression IS NULL 
        AND act.v1_cra_id IS NULL
    ),
    
    -- Totals by role (all time, up to current month)
    totals AS (
      SELECT 
        COALESCE(SUM(CASE WHEN role = 'mediateur' THEN 1 ELSE 0 END), 0)::int AS total_mediateurs,
        COALESCE(SUM(CASE WHEN role = 'conseiller' THEN 1 ELSE 0 END), 0)::int AS total_conseillers,
        COUNT(*)::int AS total_count
      FROM base_accompagnements
      WHERE DATE_TRUNC('month', date) <= DATE_TRUNC('month', CURRENT_DATE)
    ),
    
    -- Monthly breakdown for the last 12 months
    months AS (
      SELECT generate_series(${Prisma.raw(fromDate)}, CURRENT_DATE, '1 month'::interval) AS month
    ),
    counts_per_month AS (
      SELECT 
        DATE_TRUNC('month', date) AS month,
        role,
        COUNT(*)::int AS count
      FROM base_accompagnements
      WHERE date >= ${Prisma.raw(fromDate)}
      GROUP BY DATE_TRUNC('month', date), role
    ),
    monthly_aggregated AS (
      SELECT 
        EXTRACT(MONTH FROM months.month)::int AS month,
        COALESCE(SUM(CASE WHEN cpm.role = 'mediateur' THEN cpm.count END), 0)::int AS byMediateurs,
        COALESCE(SUM(CASE WHEN cpm.role = 'conseiller' THEN cpm.count END), 0)::int AS byConseillers
      FROM months
        LEFT JOIN counts_per_month cpm ON cpm.month = months.month
      GROUP BY months.month
      ORDER BY months.month
    ),
    
    -- Initial counts before the 12-month period
    initial_counts AS (
      SELECT 
        COALESCE(SUM(CASE WHEN role = 'mediateur' THEN 1 ELSE 0 END), 0)::int AS initial_mediateurs,
        COALESCE(SUM(CASE WHEN role = 'conseiller' THEN 1 ELSE 0 END), 0)::int AS initial_conseillers
      FROM base_accompagnements
      WHERE date < ${Prisma.raw(fromDate)}
    )
    
    SELECT 
      t.total_mediateurs,
      t.total_conseillers,
      t.total_count,
      CASE WHEN t.total_count > 0 
        THEN ROUND((t.total_mediateurs * 100.0 / t.total_count)::numeric, 1)::float 
        ELSE 0 
      END AS percentage_mediateurs,
      CASE WHEN t.total_count > 0 
        THEN ROUND((t.total_conseillers * 100.0 / t.total_count)::numeric, 1)::float 
        ELSE 0 
      END AS percentage_conseillers,
      (SELECT json_agg(row_to_json(m.*) ORDER BY m.month) FROM monthly_aggregated m) AS monthly_data,
      ic.initial_mediateurs,
      ic.initial_conseillers
    FROM totals t, initial_counts ic
  `

  const data = result[0]

  // Transform monthly data to perMonth format
  const perMonth: AccompagnementPerMonth[] = (data.monthly_data ?? []).map(
    ({ month, bymediateurs, byconseillers }) => ({
      byMediateurs: bymediateurs,
      byConseillers: byconseillers,
      mois: monthShortLabels[month - 1],
    }),
  )

  // Compute running totals starting from initial counts
  const runningTotalPerMonth: AccompagnementPerMonth[] = [
    {
      mois: 'Avant période',
      byMediateurs: data.initial_mediateurs,
      byConseillers: data.initial_conseillers,
    },
  ]

  for (const month of perMonth) {
    const previous = runningTotalPerMonth[runningTotalPerMonth.length - 1]
    runningTotalPerMonth.push({
      mois: month.mois,
      byMediateurs: previous.byMediateurs + month.byMediateurs,
      byConseillers: previous.byConseillers + month.byConseillers,
    })
  }

  return {
    total: data.total_count,
    series: [
      {
        label: 'Par des médiateurs numériques',
        key: 'byMediateurs',
        value: data.total_mediateurs,
        percentage: data.percentage_mediateurs,
      },
      {
        label: 'Par des conseillers numériques',
        key: 'byConseillers',
        value: data.total_conseillers,
        percentage: data.percentage_conseillers,
      },
    ],
    perMonth,
    runningTotalPerMonth,
  }
}
