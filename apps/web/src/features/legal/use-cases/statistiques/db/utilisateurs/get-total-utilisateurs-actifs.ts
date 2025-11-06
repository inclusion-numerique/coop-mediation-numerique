import { prismaClient } from '@app/web/prismaClient'

const thirtyOneDaysAgo = () => new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)

type DataUtilisateursActifs = {
  role: 'mediateurs' | 'conseillers' | 'coordinateurs'
  total: number
  value: number
}

export const getDataUtilisateursActifs = async (
  since: Date = thirtyOneDaysAgo(),
) => {
  return prismaClient.$queryRaw<DataUtilisateursActifs[]>`
    -- 1) médiateurs (ni conseiller, ni coordinateur)
    SELECT
      'mediateurs'::text AS role,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE m.derniere_creation_activite     > ${since}
           OR m.derniere_creation_beneficiaire > ${since}
      )::int AS value
    FROM users u
    JOIN mediateurs m ON m.user_id = u.id
    LEFT JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
    LEFT JOIN coordinateurs c ON c.user_id = u.id
    WHERE cn.mediateur_id IS NULL
      AND c.id IS NULL
      AND u.deleted IS NULL
      AND u.inscription_validee IS NOT NULL

    UNION ALL

    -- 2) conseillers (médiateurs qui sont conseillers, mais pas coordinateurs)
    SELECT
      'conseillers'::text AS role,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE m.derniere_creation_activite     > ${since}
           OR m.derniere_creation_beneficiaire > ${since}
      )::int AS value
    FROM users u
    JOIN mediateurs m ON m.user_id = u.id
    JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
    LEFT JOIN coordinateurs c ON c.user_id = u.id
    WHERE c.id IS NULL
      AND u.deleted IS NULL
      AND u.inscription_validee IS NOT NULL

    UNION ALL

    -- 3) coordinateurs (activité = last_login côté user)
    SELECT
      'coordinateurs'::text AS role,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE u.last_login > ${since})::int AS value
    FROM users u
    JOIN coordinateurs c ON c.user_id = u.id
    WHERE u.deleted IS NULL
      AND u.inscription_validee IS NOT NULL
  `
}

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
