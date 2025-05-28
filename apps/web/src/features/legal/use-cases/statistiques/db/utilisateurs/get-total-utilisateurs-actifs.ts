import { prismaClient } from '@app/web/prismaClient'

const getDataUtilisateursActifs = async () =>
  await prismaClient.$queryRawUnsafe<
    {
      role: 'mediateurs' | 'conseillers' | 'coordinateurs'
      total: number
      value: number
    }[]
  >(`
  WITH last_month AS (
    SELECT NOW() - INTERVAL '31 days' AS since
  ),
  value AS (
    SELECT 'mediateurs' AS role, COUNT(DISTINCT a.mediateur_id)::int AS value
    FROM users u
    JOIN mediateurs m ON u.id = m.user_id
    LEFT JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
    LEFT JOIN coordinateurs c ON u.id = c.user_id
    JOIN activites a ON a.mediateur_id = m.id
    JOIN last_month ON a.date > last_month.since
    WHERE a.suppression IS NULL AND cn.mediateur_id IS NULL AND c.id IS NULL AND u.deleted IS NULL AND u.inscription_validee IS NOT NULL
    UNION
    SELECT 'conseillers' AS role, COUNT(DISTINCT cn.id)::int AS value
    FROM users u
    JOIN mediateurs m ON u.id = m.user_id
    JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
    LEFT JOIN coordinateurs c ON u.id = c.user_id
    JOIN activites a ON a.mediateur_id = m.id
    JOIN last_month ON a.date > last_month.since
    WHERE a.suppression IS NULL AND c.id IS NULL AND u.deleted IS NULL AND u.inscription_validee IS NOT NULL
    UNION
    SELECT 'coordinateurs' AS role, COUNT(*)::int AS value
    FROM users u
    JOIN coordinateurs c ON u.id = c.user_id
    JOIN last_month ON u.last_login > last_month.since
    WHERE u.deleted IS NULL AND u.inscription_validee IS NOT NULL
  ),
  totals AS (
    SELECT 'mediateurs' AS role, COUNT(*)::int AS total
    FROM users u
    JOIN mediateurs m ON u.id = m.user_id
    LEFT JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
    LEFT JOIN coordinateurs c ON u.id = c.user_id
    WHERE cn.mediateur_id IS NULL AND c.id IS NULL AND u.deleted IS NULL AND u.inscription_validee IS NOT NULL
    UNION
    SELECT 'conseillers' AS role, COUNT(*)::int AS total
    FROM users u
    JOIN mediateurs m ON u.id = m.user_id
    JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
    LEFT JOIN coordinateurs c ON u.id = c.user_id
    WHERE u.deleted IS NULL AND c.id IS NULL AND u.inscription_validee IS NOT NULL
    UNION
    SELECT 'coordinateurs' AS role, COUNT(*)::int AS total
    FROM users u
    JOIN coordinateurs c ON u.id = c.user_id
    WHERE u.deleted IS NULL AND u.inscription_validee IS NOT NULL
  )
  SELECT t.role, t.total, COALESCE(a.value, 0) AS value
  FROM totals t
  LEFT JOIN value a ON a.role = t.role
`)

export const getTotalUtilisateursActifs = async () =>
  (await getDataUtilisateursActifs()).reduce(
    (dataUtilisateursActifs, { role, total, value }) => ({
      ...dataUtilisateursActifs,
      [role]: {
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        total,
      },
      total: dataUtilisateursActifs.total + value,
    }),
    {
      total: 0,
      mediateurs: { value: 0, percentage: 0, total: 0 },
      conseillers: { value: 0, percentage: 0, total: 0 },
      coordinateurs: { value: 0, percentage: 0, total: 0 },
    },
  )
