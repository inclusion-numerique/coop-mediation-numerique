import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { cumulsSuccessifs } from '@/libraries/collections'
import { libelleCourtDuMois } from '@/libraries/date'

type AccompagnementPerMonth = {
  byMediateurs: number
  byConseillers: number
  mois: string
}

const fromDate = `DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months')`

type CombinedQueryResult = {
  total_mediateurs: number
  total_conseillers: number
  total_count: number
  percentage_mediateurs: number
  percentage_conseillers: number
  monthly_data: {
    month_date: string
    month: number
    bymediateurs: number
    byconseillers: number
  }[]
  initial_mediateurs: number
  initial_conseillers: number
}

export const lireLesAccompagnements = async () => {
  const result = await prismaClient.$queryRaw<[CombinedQueryResult]>`
    WITH 
    -- Le dispositif conseiller numérique se DÉRIVE de main (affectation idposte active) : sous
    -- forme d'ensemble, joint une fois, et non de prédicat évalué sur chacun des millions
    -- d'accompagnements.
    conseillers AS (
      SELECT p.coop_id AS user_id
      FROM main.conseiller_numerique_en_poste cn
      JOIN main.personne p ON p.id = cn.personne_id
      WHERE p.coop_id IS NOT NULL
    ),
    base_accompagnements AS (
      SELECT 
        act.date,
        act.accompagnements,
        CASE WHEN cn.user_id IS NOT NULL THEN 'conseiller' ELSE 'mediateur' END AS role
      FROM (
        SELECT
          mediateur_id,
          DATE_TRUNC('month', date) AS date,
          SUM(accompagnements_count) AS accompagnements
        FROM activites
        WHERE suppression IS NULL
          AND v1_cra_id IS NULL
        GROUP BY mediateur_id, DATE_TRUNC('month', date)
      ) act
        LEFT JOIN mediateurs med ON act.mediateur_id = med.id
        LEFT JOIN users u ON med.user_id = u.id
        LEFT JOIN conseillers cn ON cn.user_id = u.id
    ),
    
    totals AS (
      SELECT 
        COALESCE(SUM(CASE WHEN role = 'mediateur' THEN accompagnements ELSE 0 END), 0)::int AS total_mediateurs,
        COALESCE(SUM(CASE WHEN role = 'conseiller' THEN accompagnements ELSE 0 END), 0)::int AS total_conseillers,
        COALESCE(SUM(accompagnements), 0)::int AS total_count
      FROM base_accompagnements
      WHERE DATE_TRUNC('month', date) <= DATE_TRUNC('month', CURRENT_DATE)
    ),
    
    months AS (
      SELECT generate_series(${Prisma.raw(fromDate)}, CURRENT_DATE, '1 month'::interval) AS month
    ),
    counts_per_month AS (
      SELECT 
        DATE_TRUNC('month', date) AS month,
        role,
        SUM(accompagnements)::int AS count
      FROM base_accompagnements
      WHERE date >= ${Prisma.raw(fromDate)}
      GROUP BY DATE_TRUNC('month', date), role
    ),
    monthly_aggregated AS (
      SELECT
        months.month AS month_date,
        EXTRACT(MONTH FROM months.month)::int AS month,
        COALESCE(SUM(CASE WHEN cpm.role = 'mediateur' THEN cpm.count END), 0)::int AS byMediateurs,
        COALESCE(SUM(CASE WHEN cpm.role = 'conseiller' THEN cpm.count END), 0)::int AS byConseillers
      FROM months
        LEFT JOIN counts_per_month cpm ON cpm.month = months.month
      GROUP BY months.month
      ORDER BY months.month
    ),
    
    initial_counts AS (
      SELECT 
        COALESCE(SUM(CASE WHEN role = 'mediateur' THEN accompagnements ELSE 0 END), 0)::int AS initial_mediateurs,
        COALESCE(SUM(CASE WHEN role = 'conseiller' THEN accompagnements ELSE 0 END), 0)::int AS initial_conseillers
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
      (SELECT json_agg(row_to_json(m.*) ORDER BY m.month_date) FROM monthly_aggregated m) AS monthly_data,
      ic.initial_mediateurs,
      ic.initial_conseillers
    FROM totals t, initial_counts ic
  `

  const data = result[0]

  const perMonth: AccompagnementPerMonth[] = (data.monthly_data ?? []).map(
    ({ month, bymediateurs, byconseillers }) => ({
      byMediateurs: bymediateurs,
      byConseillers: byconseillers,
      mois: libelleCourtDuMois(month),
    }),
  )

  const runningTotalPerMonth: AccompagnementPerMonth[] = cumulsSuccessifs(
    {
      mois: 'Avant période',
      byMediateurs: data.initial_mediateurs,
      byConseillers: data.initial_conseillers,
    },
    perMonth,
    (previous, month) => ({
      mois: month.mois,
      byMediateurs: previous.byMediateurs + month.byMediateurs,
      byConseillers: previous.byConseillers + month.byConseillers,
    }),
  )

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
