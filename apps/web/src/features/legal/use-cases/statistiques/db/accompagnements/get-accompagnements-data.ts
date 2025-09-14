import { prismaClient } from '@app/web/prismaClient'
import { monthShortLabels } from '@app/web/utils/monthShortLabels'
import { Prisma } from '@prisma/client'

type AccompagnementRole = 'mediateur' | 'conseiller'

type InitialCountBeforePeriod = { role: AccompagnementRole; count: number }

type AccompagnementsData = {
  byMediateurs: number
  byConseillers: number
}

type AccompagnementPerMonth = AccompagnementsData & { mois: string }

const fromDate = `DATE_TRUNC('month', CURRENT_DATE - INTERVAL '${11} months')`

const getAccompagnementsPerMonth = async () =>
  await prismaClient.$queryRaw<
    { bymediateurs: number; byconseillers: number; month: number }[]
  >`
  WITH filtered_accompagnements AS (SELECT act.date,
    CASE
      WHEN cn.id IS NOT NULL THEN 'conseiller'
      ELSE 'mediateur'
      END AS role
  FROM activites act
    JOIN accompagnements acc ON acc.activite_id = act.id
    LEFT JOIN mediateurs med ON act.mediateur_id = med.id
    LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id
  WHERE 
    act.suppression IS NULL 
    AND act.v1_cra_id IS NULL
    AND act.date >= ${Prisma.raw(fromDate)}),
  months AS (SELECT generate_series(${Prisma.raw(fromDate)}, ${Prisma.raw(
    'CURRENT_DATE',
  )}, '1 month'::interval) AS month), counts_per_month AS (
    SELECT DATE_TRUNC('month', date) AS month, role, COUNT(*)::int AS count
    FROM filtered_accompagnements
    GROUP BY DATE_TRUNC('month', date), role)
      SELECT
        EXTRACT(MONTH FROM months.month)::int AS month,
        COALESCE(SUM(CASE WHEN cpm.role = 'mediateur' THEN cpm.count END), 0)::int  AS byMediateurs,
        COALESCE(SUM(CASE WHEN cpm.role = 'conseiller' THEN cpm.count END), 0)::int AS byConseillers
      FROM months
        LEFT JOIN counts_per_month cpm ON cpm.month = months.month
      GROUP BY months.month
      ORDER BY months.month
  `.then((result) =>
    result.map(({ bymediateurs, byconseillers, month }) => ({
      byMediateurs: bymediateurs,
      byConseillers: byconseillers,
      mois: monthShortLabels[month - 1],
    })),
  )

const getInitialCountBeforePeriod = async () =>
  await prismaClient.$queryRaw<InitialCountBeforePeriod[]>`
      SELECT CASE
                 WHEN cn.id IS NOT NULL THEN 'conseiller'
                 ELSE 'mediateur'
                 END       AS role,
             COUNT(*)::int AS count
      FROM activites act
               JOIN accompagnements acc ON acc.activite_id = act.id
               LEFT JOIN mediateurs med ON act.mediateur_id = med.id
               LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id
      WHERE act.suppression IS NULL
        AND act.date < ${Prisma.raw(fromDate)}
      GROUP BY role`

const toInitialRunningTotalPerMonth = (
  { byMediateurs, byConseillers }: AccompagnementsData,
  { role, count }: InitialCountBeforePeriod,
) => ({
  byMediateurs: byMediateurs + (role === 'mediateur' ? count : 0),
  byConseillers: byConseillers + (role === 'conseiller' ? count : 0),
})

const initialRunningTotalPerMonth = async () => [
  {
    mois: 'Avant période',
    ...(await getInitialCountBeforePeriod()).reduce(
      toInitialRunningTotalPerMonth,
      { byMediateurs: 0, byConseillers: 0 },
    ),
  },
]

const toRunningTotalPerMonth = (
  accompagnementsPerMonth: AccompagnementPerMonth[],
  { mois, byMediateurs, byConseillers }: AccompagnementPerMonth,
  index: number,
) => [
  ...accompagnementsPerMonth,
  {
    mois,
    byMediateurs: accompagnementsPerMonth[index].byMediateurs + byMediateurs,
    byConseillers: accompagnementsPerMonth[index].byConseillers + byConseillers,
  },
]

export const getAccompagnementsData = async () => {
  const perMonth = await getAccompagnementsPerMonth()

  return {
    perMonth,
    runningTotalPerMonth: perMonth.reduce(
      toRunningTotalPerMonth,
      await initialRunningTotalPerMonth(),
    ),
  }
}
