import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

export type EquipeSearchParams = {
  lignes?: string
  page?: string
  recherche?: string
  tri?: 'alphabetique' | 'recent' | 'ancien'
}

type MediateurFound = {
  email: string
  phone: string | null
  mediateur_id: string | null
  first_name: string | null
  last_name: string | null
  conseiller_numerique_id: string | null
  date_derniere_activite: Date | null
  creation: Date
  suppression: Date
  type: 'coordinated' | 'invited'
}

const triMap: Record<NonNullable<EquipeSearchParams['tri']>, string> = {
  ancien: 'creation ASC',
  recent: 'creation DESC',
  alphabetique: 'LOWER(last_name) ASC, LOWER(first_name) ASC',
}

export const searchMediateursCoordonneBy =
  ({ id }: { id: string }) =>
  async (searchParams: EquipeSearchParams, anciensMembres: boolean) => {
    const { take, skip } = takeAndSkipFromPage({
      page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
      pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
    })

    const mediateurs: MediateurFound[] = await prismaClient.$queryRaw`
      WITH combined_data AS (
        SELECT
          invitations.email,
          invitations.mediateur_id AS mediateur_id,
          users.first_name AS first_name,
          users.last_name AS last_name,
          users.phone AS phone,
          conseillers.id AS conseiller_numerique_id,
          NULL AS suppression,
          NULL AS date_derniere_activite,
          invitations.creation AS creation,
          'invited' AS type
      FROM "invitations_equipes" AS invitations
        LEFT JOIN "mediateurs" AS mediateurs ON mediateurs.id = invitations.mediateur_id
        LEFT JOIN "users" AS users ON users.id = mediateurs.user_id
        LEFT JOIN "conseillers_numeriques" AS conseillers ON conseillers."mediateur_id" = mediateurs."id"
        WHERE invitations."coordinateur_id" = ${id}::uuid
        AND (invitations.acceptee IS NULL AND invitations.refusee IS NULL)
      UNION ALL
        SELECT
          users.email AS email,
          mediateurs.id AS mediateurId,
          users.first_name AS first_name,
          users.last_name AS last_name,
          users.phone AS phone,
          conseillers.id AS conseiller_numerique_id,
          mc.suppression AS suppression,
          (SELECT MAX(activites.date)
           FROM "activites" AS activites
           WHERE activites."mediateur_id" = mediateurs.id) AS date_derniere_activite,
          mediateurs.creation AS creation,
          'coordinated' AS type
      FROM "mediateurs" AS mediateurs
        LEFT JOIN "users" AS users ON users."id" = mediateurs."user_id"
        LEFT JOIN "conseillers_numeriques" AS conseillers ON conseillers."mediateur_id" = mediateurs."id"
        INNER JOIN "mediateurs_coordonnes" AS mc ON mc."mediateur_id" = mediateurs."id"
        WHERE mc.coordinateur_id = ${id}::uuid AND mc.suppression ${Prisma.raw(anciensMembres ? 'IS NOT NULL' : 'IS NULL')})
      SELECT *
      FROM combined_data
      WHERE (
          ${Prisma.raw(
            searchParams.recherche == null
              ? 'TRUE'
              : `
          (
            email ILIKE '%${searchParams.recherche}%'
            OR first_name ILIKE '%${searchParams.recherche}%'
            OR last_name ILIKE '%${searchParams.recherche}%'
          )
        `,
          )}
        )
      ORDER BY ${Prisma.raw(searchParams.tri ? triMap[searchParams.tri] : triMap.alphabetique)} LIMIT ${take} OFFSET ${skip}
    `

    const result: [{ count: number }] = await prismaClient.$queryRaw`
      WITH combined_data AS (
        SELECT
          invitations.email,
          NULL AS first_name,
          NULL AS last_name,
          invitations.creation AS creation,
          'invited' AS type
        FROM "invitations_equipes" AS invitations
        WHERE invitations."coordinateur_id" = ${id}::uuid
        AND (invitations.acceptee IS NULL OR invitations.refusee IS NULL)
      UNION ALL
      SELECT
        users.email AS email,
        users.first_name AS first_name,
        users.last_name AS last_name,
        mediateurs.creation AS creation,
        'coordinated' AS type
      FROM "mediateurs" AS mediateurs
        LEFT JOIN "users" AS users ON users."id" = mediateurs."user_id"
        INNER JOIN "mediateurs_coordonnes" AS mc ON mc."mediateur_id" = mediateurs."id"
        WHERE mc.coordinateur_id = ${id}::uuid AND mc.suppression ${Prisma.raw(anciensMembres ? 'IS NOT NULL' : 'IS NULL')}
    )
      SELECT COUNT(*)::int AS count
      FROM combined_data
      WHERE (
          ${Prisma.raw(
            searchParams.recherche == null
              ? 'TRUE'
              : `
          (
            email ILIKE '%${searchParams.recherche}%'
            OR first_name ILIKE '%${searchParams.recherche}%'
            OR last_name ILIKE '%${searchParams.recherche}%'
          )
        `,
          )}
        )
    `

    return {
      mediateurs,
      matchesCount: result[0].count,
      totalPages: take ? Math.ceil(result[0].count / take) : 1,
    }
  }
