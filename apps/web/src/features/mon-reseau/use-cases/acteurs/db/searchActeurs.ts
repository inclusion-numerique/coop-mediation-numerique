import { departementCodeFromInseeRegex } from '@app/web/features/mon-reseau/departementCodeFromInseeRegex'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { orderItemsByIndexedValues } from '@app/web/utils/orderItemsByIndexedValues'
import { Prisma } from '@prisma/client'
import type { ActeursSearchParams } from '../validation/ActeursFilters'

const ACTEURS_DEFAULT_PAGE_SIZE = 20

export type SearchActeursOptions = {
  departementCode: string
  searchParams: ActeursSearchParams
}

const acteurSelect = {
  id: true,
  firstName: true,
  lastName: true,
  name: true,
  email: true,
  phone: true,
  coordinateur: {
    select: {
      id: true,
      conseillerNumeriqueId: true,
    },
  },
  mediateur: {
    select: {
      id: true,
      conseillerNumerique: { select: { id: true } },
      coordinations: {
        where: { suppression: null },
        select: {
          coordinateur: {
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: { enActivite: { where: { suppression: null, fin: null } } },
      },
    },
  },
} satisfies Prisma.UserSelect

export type ActeurForList = Prisma.UserGetPayload<{
  select: typeof acteurSelect
}>

const getActeursByIds = async ({ ids }: { ids: string[] }) =>
  prismaClient.user.findMany({
    where: { id: { in: ids } },
    select: acteurSelect,
  })

export const searchActeurs = async ({
  departementCode,
  searchParams,
}: SearchActeursOptions) => {
  const page = toNumberOr(searchParams.page)(DEFAULT_PAGE)
  const pageSize = toNumberOr(searchParams.lignes)(ACTEURS_DEFAULT_PAGE_SIZE)

  const { take, skip } = takeAndSkipFromPage({ page, pageSize })

  // Build search condition
  const searchTerm = searchParams.recherche?.trim()
  const normalizedSearchTerm = searchTerm
    ? Prisma.sql`NULLIF(regexp_replace(lower(unaccent(${searchTerm})), '[\\s-]', '', 'g'), '')`
    : null

  const searchCondition = normalizedSearchTerm
    ? Prisma.sql`(
        NULLIF(regexp_replace(lower(unaccent(u.last_name)), '[\\s-]', '', 'g'), '') ILIKE '%' || ${normalizedSearchTerm} || '%'
        OR NULLIF(regexp_replace(lower(unaccent(u.first_name)), '[\\s-]', '', 'g'), '') ILIKE '%' || ${normalizedSearchTerm} || '%'
        OR lower(u.email) ILIKE '%' || ${searchTerm} || '%'
      )`
    : Prisma.sql`TRUE`

  // Build role condition
  const roleCondition =
    searchParams.role === 'conseiller_numerique'
      ? Prisma.sql`cn.id IS NOT NULL`
      : searchParams.role === 'mediateur_numerique'
        ? Prisma.sql`cn.id IS NULL AND m.id IS NOT NULL`
        : Prisma.sql`TRUE`

  // Build lieu filter conditions
  const lieuxCondition =
    searchParams.lieux && searchParams.lieux.length > 0
      ? Prisma.sql`(s1.id = ANY(${searchParams.lieux}::UUID[]) OR s2.id = ANY(${searchParams.lieux}::UUID[]))`
      : Prisma.sql`TRUE`

  const communesCondition =
    searchParams.communes && searchParams.communes.length > 0
      ? Prisma.sql`(s1.code_insee = ANY(${searchParams.communes}::TEXT[]) OR s2.code_insee = ANY(${searchParams.communes}::TEXT[]))`
      : Prisma.sql`TRUE`

  // Departements filter (within location, not the main department context)
  const departementsFilterCondition =
    searchParams.departements && searchParams.departements.length > 0
      ? Prisma.sql`(
          SUBSTRING(s1.code_insee FROM ${departementCodeFromInseeRegex}) = ANY(${searchParams.departements}::TEXT[])
          OR SUBSTRING(s2.code_insee FROM ${departementCodeFromInseeRegex}) = ANY(${searchParams.departements}::TEXT[])
        )`
      : Prisma.sql`TRUE`

  // Sort direction
  const sortDirection =
    searchParams.tri === 'nomza' ? Prisma.raw('DESC') : Prisma.raw('ASC')

  // Get paginated user IDs using CTE to handle DISTINCT + ORDER BY
  const userIds = await prismaClient.$queryRaw<{ id: string }[]>`
    WITH distinct_acteurs AS (
      SELECT DISTINCT ON (u.id)
        u.id,
        u.last_name,
        u.first_name
      FROM users u
      LEFT JOIN employes_structures es ON es.user_id = u.id AND es.suppression IS NULL AND es.fin_emploi IS NULL
      LEFT JOIN structures s1 ON s1.id = es.structure_id
      LEFT JOIN mediateurs m ON m.user_id = u.id
      LEFT JOIN mediateurs_en_activite mea ON mea.mediateur_id = m.id AND mea.suppression IS NULL AND mea.fin_activite IS NULL
      LEFT JOIN structures s2 ON s2.id = mea.structure_id
      LEFT JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
      WHERE u.deleted IS NULL
        AND u.inscription_validee IS NOT NULL
        AND (
          SUBSTRING(s1.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
          OR SUBSTRING(s2.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
        )
        AND ${searchCondition}
        AND ${roleCondition}
        AND ${lieuxCondition}
        AND ${communesCondition}
        AND ${departementsFilterCondition}
    )
    SELECT id FROM distinct_acteurs
    ORDER BY last_name ${sortDirection}, first_name ${sortDirection}, id ASC
    LIMIT ${take} OFFSET ${skip}
  `

  const ids = userIds.map((row) => row.id)

  // Get total count
  const countResult = await prismaClient.$queryRaw<[{ count: number }]>`
    SELECT COUNT(DISTINCT u.id)::integer AS count
    FROM users u
    LEFT JOIN employes_structures es ON es.user_id = u.id AND es.suppression IS NULL AND es.fin_emploi IS NULL
    LEFT JOIN structures s1 ON s1.id = es.structure_id
    LEFT JOIN mediateurs m ON m.user_id = u.id
    LEFT JOIN mediateurs_en_activite mea ON mea.mediateur_id = m.id AND mea.suppression IS NULL AND mea.fin_activite IS NULL
    LEFT JOIN structures s2 ON s2.id = mea.structure_id
    LEFT JOIN conseillers_numeriques cn ON cn.mediateur_id = m.id
    WHERE u.deleted IS NULL
      AND u.inscription_validee IS NOT NULL
      AND (
        SUBSTRING(s1.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
        OR SUBSTRING(s2.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
      )
      AND ${searchCondition}
      AND ${roleCondition}
      AND ${lieuxCondition}
      AND ${communesCondition}
      AND ${departementsFilterCondition}
  `

  const totalCount = countResult[0]?.count ?? 0

  // Hydrate full objects with Prisma
  const acteurs = ids.length > 0 ? await getActeursByIds({ ids }) : []

  // Reorder to maintain SQL ordering
  const orderedActeurs = orderItemsByIndexedValues(acteurs, ids)

  const totalPages = take ? Math.ceil(totalCount / take) : 1

  return {
    acteurs: orderedActeurs,
    totalCount,
    totalPages,
    page,
    pageSize,
  }
}

export type SearchActeursResult = Awaited<ReturnType<typeof searchActeurs>>
