import { prismaClient } from '@app/web/prismaClient'

type UtilisateursActifsRaw = {
  role: 'mediateurs' | 'conseillers' | 'coordinateurs'
  month: string
  value: number
}

type UtilisateursActifsParMois = {
  mois: string
  mediateursActifs: number
  conseillersActifs: number
  coordinateursActifs: number
}

const formatDataForGraph = (
  data: UtilisateursActifsRaw[],
): UtilisateursActifsParMois[] => {
  const grouped: Record<string, UtilisateursActifsParMois> = {}

  for (const { role, month, value } of data) {
    if (!grouped[month]) {
      grouped[month] = {
        mois: month,
        mediateursActifs: 0,
        conseillersActifs: 0,
        coordinateursActifs: 0,
      }
    }

    if (role === 'mediateurs') grouped[month].mediateursActifs = value
    else if (role === 'conseillers') grouped[month].conseillersActifs = value
    else grouped[month].coordinateursActifs = value
  }

  return Object.values(grouped).sort((a, b) => a.mois.localeCompare(b.mois))
}

export const getUtilisateursActifsPerMonth = async (): Promise<
  UtilisateursActifsParMois[]
> => {
  const rawData = await prismaClient.$queryRawUnsafe<UtilisateursActifsRaw[]>(
    `
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE - INTERVAL '11 months'),
        date_trunc('month', CURRENT_DATE),
        '1 month'
      ) AS month
    ),
    mediateurs_actifs AS (
      SELECT
        date_trunc('month', a.date) AS month,
        'mediateurs' AS role,
        COUNT(DISTINCT a.mediateur_id)::int AS value
      FROM users u
      JOIN mediateurs m ON u.id = m.user_id
      LEFT JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
      LEFT JOIN coordinateurs c ON u.id = c.user_id
      JOIN activites a ON a.mediateur_id = m.id
      WHERE a.suppression IS NULL
        AND cn.mediateur_id IS NULL
        AND c.id IS NULL
        AND u.deleted IS NULL
        AND u.inscription_validee IS NOT NULL
      GROUP BY 1
    ),
    conseillers_actifs AS (
      SELECT
        date_trunc('month', a.date) AS month,
        'conseillers' AS role,
        COUNT(DISTINCT cn.id)::int AS value
      FROM users u
      JOIN mediateurs m ON u.id = m.user_id
      JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
      LEFT JOIN coordinateurs c ON u.id = c.user_id
      JOIN activites a ON a.mediateur_id = m.id
      WHERE a.suppression IS NULL
        AND c.id IS NULL
        AND u.deleted IS NULL
        AND u.inscription_validee IS NOT NULL
      GROUP BY 1
    ),
    coordinateurs_actifs AS (
      SELECT
        date_trunc('month', u.last_login) AS month,
        'coordinateurs' AS role,
        COUNT(*)::int AS value
      FROM users u
      JOIN coordinateurs c ON u.id = c.user_id
      WHERE u.deleted IS NULL
        AND u.inscription_validee IS NOT NULL
        AND u.last_login IS NOT NULL
      GROUP BY 1
    ),
    all_data AS (
      SELECT * FROM mediateurs_actifs
      UNION ALL
      SELECT * FROM conseillers_actifs
      UNION ALL
      SELECT * FROM coordinateurs_actifs
    )
    SELECT
      to_char(m.month, 'YYYY-MM') AS month,
      r.role,
      COALESCE(SUM(a.value), 0)::int AS value
    FROM months m
    CROSS JOIN (
      SELECT 'mediateurs' AS role
      UNION SELECT 'conseillers'
      UNION SELECT 'coordinateurs'
    ) r
    LEFT JOIN all_data a ON a.month = m.month AND a.role = r.role
    GROUP BY m.month, r.role
    ORDER BY m.month ASC, r.role ASC
    `,
  )

  return formatDataForGraph(rawData)
}

export const getUtilisateursActifsData = async () => ({
  perMonth: await getUtilisateursActifsPerMonth(),
})
