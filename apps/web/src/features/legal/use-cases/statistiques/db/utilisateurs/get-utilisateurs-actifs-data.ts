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
  const rawData = await prismaClient.$queryRaw<UtilisateursActifsRaw[]>`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE - INTERVAL '11 months'),
        date_trunc('month', CURRENT_DATE),
        '1 month'
      ) AS month_start
    ),
    roles AS (
      SELECT 'mediateurs'::text AS role
      UNION ALL SELECT 'conseillers'
      UNION ALL SELECT 'coordinateurs'
    ),

    -- médiateurs actifs par mois (au moins une des deux dates tombe dans le mois)
    mediateurs_m AS (
      SELECT
        ms.month_start,
        COUNT(DISTINCT m.id)::int AS value
      FROM months ms
      JOIN users u ON u.deleted IS NULL AND u.inscription_validee IS NOT NULL
      JOIN mediateurs m ON m.user_id = u.id
      LEFT JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
      LEFT JOIN coordinateurs c ON c.user_id = u.id
      WHERE cn.mediateur_id IS NULL
        AND c.id IS NULL
        AND (
          (m.derniere_creation_activite >= ms.month_start
           AND m.derniere_creation_activite <  ms.month_start + INTERVAL '1 month')
          OR
          (m.derniere_creation_beneficiaire >= ms.month_start
           AND m.derniere_creation_beneficiaire <  ms.month_start + INTERVAL '1 month')
        )
      GROUP BY ms.month_start
    ),

    -- conseillers actifs par mois (même critère d’activité via le médiateur)
    conseillers_m AS (
      SELECT
        ms.month_start,
        COUNT(DISTINCT cn.id)::int AS value
      FROM months ms
      JOIN users u ON u.deleted IS NULL AND u.inscription_validee IS NOT NULL
      JOIN mediateurs m ON m.user_id = u.id
      JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
      LEFT JOIN coordinateurs c ON c.user_id = u.id
      WHERE c.id IS NULL
        AND (
          (m.derniere_creation_activite >= ms.month_start
           AND m.derniere_creation_activite <  ms.month_start + INTERVAL '1 month')
          OR
          (m.derniere_creation_beneficiaire >= ms.month_start
           AND m.derniere_creation_beneficiaire <  ms.month_start + INTERVAL '1 month')
        )
      GROUP BY ms.month_start
    ),

    -- coordinateurs actifs par mois (last_login dans le mois)
    coordinateurs_m AS (
      SELECT
        ms.month_start,
        COUNT(*)::int AS value
      FROM months ms
      JOIN users u ON u.deleted IS NULL AND u.inscription_validee IS NOT NULL
      JOIN coordinateurs c ON c.user_id = u.id
      WHERE u.last_login IS NOT NULL
        AND u.last_login >= ms.month_start
        AND u.last_login <  ms.month_start + INTERVAL '1 month'
      GROUP BY ms.month_start
    )

    SELECT to_char(ms.month_start, 'YYYY-MM') AS month, r.role,
           COALESCE(
             CASE r.role
               WHEN 'mediateurs'    THEN (SELECT value FROM mediateurs_m    mm WHERE mm.month_start = ms.month_start)
               WHEN 'conseillers'   THEN (SELECT value FROM conseillers_m   cm WHERE cm.month_start = ms.month_start)
               WHEN 'coordinateurs' THEN (SELECT value FROM coordinateurs_m co WHERE co.month_start = ms.month_start)
             END, 0
           )::int AS value
    FROM months ms
    CROSS JOIN roles r
    ORDER BY ms.month_start, r.role;
  `

  return formatDataForGraph(rawData)
}

export const getUtilisateursActifsData = async () => ({
  perMonth: await getUtilisateursActifsPerMonth(),
})
