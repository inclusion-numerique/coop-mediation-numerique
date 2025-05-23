import { prismaClient } from '@app/web/prismaClient'

export const getTotalAccompagnements = async () => {
  const totalData = await prismaClient.$queryRaw<
    { role: 'mediateur' | 'conseiller'; count: number; percentage: number }[]
  >`
  WITH role_counts AS (
    SELECT
      CASE
        WHEN cn.id IS NOT NULL THEN 'conseiller'
        ELSE 'mediateur'
        END AS role,
      COUNT(*)::int AS count
    FROM activites act
      JOIN accompagnements acc ON acc.activite_id = act.id
      LEFT JOIN mediateurs med ON act.mediateur_id = med.id
      LEFT JOIN conseillers_numeriques cn ON med.id = cn.mediateur_id
    WHERE act.suppression IS NULL AND DATE_TRUNC('month', act.date) <= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY
        CASE
          WHEN cn.id IS NOT NULL THEN 'conseiller'
          ELSE 'mediateur'
          END
  ),
  total AS (SELECT SUM(count)::numeric AS total_count FROM role_counts)
    SELECT
      rc.role,
      rc.count,
      ROUND((rc.count * 100.0 / t.total_count)::numeric, 1)::float AS percentage
    FROM role_counts rc, total t
  `

  return totalData.reduce(
    ({ byMediateurs, byConseillers, total }, { role, count, percentage }) => {
      return {
        byMediateurs: {
          value: byMediateurs.value + (role === 'mediateur' ? count : 0),
          percentage:
            byMediateurs.percentage + (role === 'mediateur' ? percentage : 0),
        },
        byConseillers: {
          value: byConseillers.value + (role === 'conseiller' ? count : 0),
          percentage:
            byConseillers.percentage + (role === 'conseiller' ? percentage : 0),
        },
        total: total + count,
      }
    },
    {
      total: 0,
      byMediateurs: { value: 0, percentage: 0 },
      byConseillers: { value: 0, percentage: 0 },
    },
  )
}
