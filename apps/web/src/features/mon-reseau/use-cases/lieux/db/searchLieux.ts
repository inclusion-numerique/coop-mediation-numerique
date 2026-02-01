import { departementCodeFromInseeRegex } from '@app/web/features/mon-reseau/departementCodeFromInseeRegex'
import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { orderItemsByIndexedValues } from '@app/web/utils/orderItemsByIndexedValues'
import { Prisma } from '@prisma/client'
import type { LieuxSearchParams } from '../validation/LieuxFilters'

const LIEUX_DEFAULT_PAGE_SIZE = 20

export type SearchLieuxOptions = {
  departementCode: string
  searchParams: LieuxSearchParams
}

export const lieuxForListSelect = {
  id: true,
  nom: true,
  adresse: true,
  complementAdresse: true,
  commune: true,
  codePostal: true,
  codeInsee: true,
  modification: true,
  derniereModificationPar: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
    },
  },
  derniereModificationSource: true,
  visiblePourCartographieNationale: true,
  structureCartographieNationaleId: true,
  _count: {
    select: {
      mediateursEnActivite: {
        where: {
          suppression: null,
          fin: null,
        },
      },
    },
  },
} satisfies Prisma.StructureSelect

export type LieuForList = Prisma.StructureGetPayload<{
  select: typeof lieuxForListSelect
}>

const getLieuxByIds = async ({
  ids,
}: {
  ids: string[]
}): Promise<LieuForList[]> => {
  const lieux = await prismaClient.structure.findMany({
    where: { id: { in: ids } },
    select: lieuxForListSelect,
  })

  return lieux
}

/**
 * Lieux in this annuaire contexts are only lieux that have:
 * - At least one active mediateur_en_activite
 * - OR visible_pour_cartographie_nationale is true
 */
export const searchLieux = async ({
  departementCode,
  searchParams,
}: SearchLieuxOptions) => {
  const page = toNumberOr(searchParams.page)(DEFAULT_PAGE)
  const pageSize = toNumberOr(searchParams.lignes)(LIEUX_DEFAULT_PAGE_SIZE)

  const { take, skip } = takeAndSkipFromPage({ page, pageSize })

  // Build search condition
  const searchTerm = searchParams.recherche?.trim()
  const normalizedSearchTerm = searchTerm
    ? Prisma.sql`NULLIF(regexp_replace(lower(unaccent(${searchTerm})), '[\\s-]', '', 'g'), '')`
    : null

  const searchCondition = normalizedSearchTerm
    ? Prisma.sql`(
        NULLIF(regexp_replace(lower(unaccent(s.nom)), '[\\s-]', '', 'g'), '') ILIKE '%' || ${normalizedSearchTerm} || '%'
        OR NULLIF(regexp_replace(lower(unaccent(s.adresse)), '[\\s-]', '', 'g'), '') ILIKE '%' || ${normalizedSearchTerm} || '%'
        OR s.siret ILIKE '%' || ${searchTerm} || '%'
        OR s.code_postal ILIKE '%' || ${searchTerm} || '%'
      )`
    : Prisma.sql`TRUE`

  // Build communes filter condition
  const communesCondition =
    searchParams.communes && searchParams.communes.length > 0
      ? Prisma.sql`s.code_insee = ANY(${searchParams.communes}::TEXT[])`
      : Prisma.sql`TRUE`

  // Departements filter (within location, not the main department context)
  const departementsFilterCondition =
    searchParams.departements && searchParams.departements.length > 0
      ? Prisma.sql`SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ANY(${searchParams.departements}::TEXT[])`
      : Prisma.sql`TRUE`

  // Build mediateurs filter condition
  const mediateursCondition =
    searchParams.mediateurs && searchParams.mediateurs.length > 0
      ? Prisma.sql`mea.mediateur_id = ANY(${searchParams.mediateurs}::UUID[])`
      : Prisma.sql`TRUE`

  // Sort direction
  // nomaz = A to Z = ASC, nomza = Z to A = DESC
  // majrecent = newest first = DESC, majancien = oldest first = ASC
  const sortDirection =
    searchParams.tri === 'nomza' || searchParams.tri === 'majrecent'
      ? Prisma.raw('DESC')
      : Prisma.raw('ASC')

  // Determine sort column for CTE
  const sortColumn =
    searchParams.tri === 'majrecent' || searchParams.tri === 'majancien'
      ? Prisma.raw('modification')
      : Prisma.raw('nom')

  // Get paginated structure IDs using CTE to handle DISTINCT + ORDER BY
  const structureIds = await prismaClient.$queryRaw<{ id: string }[]>`
    WITH distinct_lieux AS (
      SELECT DISTINCT ON (s.id)
        s.id,
        s.${sortColumn}
      FROM structures s
      LEFT JOIN mediateurs_en_activite mea ON mea.structure_id = s.id AND mea.suppression IS NULL AND mea.fin_activite IS NULL
      WHERE s.suppression IS NULL
        AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
        AND ${searchCondition}
        AND ${communesCondition}
        AND ${departementsFilterCondition}
        AND ${mediateursCondition}
        AND (
          s.visible_pour_cartographie_nationale = true
          OR EXISTS (
            SELECT 1
            FROM mediateurs_en_activite mea2
            WHERE mea2.structure_id = s.id
              AND mea2.suppression IS NULL
              AND mea2.fin_activite IS NULL
          )
        )
    )
    SELECT id FROM distinct_lieux
    ORDER BY ${sortColumn} ${sortDirection}, id ASC
    LIMIT ${take} OFFSET ${skip}
  `

  const ids = structureIds.map((row) => row.id)

  // Get total count
  const countResult = await prismaClient.$queryRaw<[{ count: number }]>`
    SELECT COUNT(DISTINCT s.id)::integer AS count
    FROM structures s
    LEFT JOIN mediateurs_en_activite mea ON mea.structure_id = s.id AND mea.suppression IS NULL AND mea.fin_activite IS NULL
    WHERE s.suppression IS NULL
      AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
      AND ${searchCondition}
      AND ${communesCondition}
      AND ${departementsFilterCondition}
      AND ${mediateursCondition}
      AND (
        s.visible_pour_cartographie_nationale = true
        OR EXISTS (
          SELECT 1
          FROM mediateurs_en_activite mea2
          WHERE mea2.structure_id = s.id
            AND mea2.suppression IS NULL
            AND mea2.fin_activite IS NULL
        )
      )
  `

  const totalCount = countResult[0]?.count ?? 0

  // Hydrate full objects with Prisma
  const lieux = ids.length > 0 ? await getLieuxByIds({ ids }) : []

  // Reorder to maintain SQL ordering
  const orderedLieux = orderItemsByIndexedValues(lieux, ids)

  const totalPages = take ? Math.ceil(totalCount / take) : 1

  return {
    lieux: orderedLieux,
    totalCount,
    totalPages,
    page,
    pageSize,
  }
}

export type SearchLieuxResult = Awaited<ReturnType<typeof searchLieux>>
