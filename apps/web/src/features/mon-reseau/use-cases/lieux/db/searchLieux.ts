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

const lieuBaseSelect = {
  id: true,
  nom: true,
  adresse: true,
  complementAdresse: true,
  commune: true,
  codePostal: true,
  codeInsee: true,
  modification: true,
  visiblePourCartographieNationale: true,
  structureCartographieNationaleId: true,
} satisfies Prisma.StructureSelect

type LieuBaseForList = Prisma.StructureGetPayload<{
  select: typeof lieuBaseSelect
}>

export type LieuForList = LieuBaseForList & {
  mediateursCount: number
}

const getLieuxByIds = async ({
  ids,
}: {
  ids: string[]
}): Promise<LieuForList[]> => {
  const lieux = await prismaClient.structure.findMany({
    where: { id: { in: ids } },
    select: lieuBaseSelect,
  })

  // Count mediateurs with proper validation (matching acteurs search logic)
  // Uses both employes_structures and mediateurs_en_activite like acteurs search
  const mediateursCountsResult = await prismaClient.$queryRaw<
    { structure_id: string; count: number }[]
  >`
    SELECT 
      structure_id,
      COUNT(DISTINCT user_id)::integer AS count
    FROM (
      -- Mediateurs en activité
      SELECT mea.structure_id, u.id AS user_id
      FROM mediateurs_en_activite mea
      JOIN mediateurs m ON m.id = mea.mediateur_id
      JOIN users u ON u.id = m.user_id
      WHERE mea.suppression IS NULL
        AND u.deleted IS NULL
        AND u.inscription_validee IS NOT NULL
        AND mea.structure_id = ANY(${ids}::UUID[])
      
      UNION
      
      -- Employes structures (who are also mediateurs)
      SELECT es.structure_id, u.id AS user_id
      FROM employes_structures es
      JOIN users u ON u.id = es.user_id
      JOIN mediateurs m ON m.user_id = u.id
      WHERE es.suppression IS NULL
        AND u.deleted IS NULL
        AND u.inscription_validee IS NOT NULL
        AND es.structure_id = ANY(${ids}::UUID[])
    ) combined
    GROUP BY structure_id
  `

  const countsMap = new Map(
    mediateursCountsResult.map((r) => [r.structure_id, r.count]),
  )

  return lieux.map((lieu) => ({
    ...lieu,
    mediateursCount: countsMap.get(lieu.id) ?? 0,
  }))
}

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
  const isSortByModification =
    searchParams.tri === 'majrecent' || searchParams.tri === 'majancien'

  // Get paginated structure IDs using CTE to handle DISTINCT + ORDER BY
  const structureIds = isSortByModification
    ? await prismaClient.$queryRaw<{ id: string }[]>`
        WITH distinct_lieux AS (
          SELECT DISTINCT ON (s.id)
            s.id,
            s.modification
          FROM structures s
          LEFT JOIN mediateurs_en_activite mea ON mea.structure_id = s.id AND mea.suppression IS NULL
          WHERE s.suppression IS NULL
            AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
            AND ${searchCondition}
            AND ${communesCondition}
            AND ${departementsFilterCondition}
            AND ${mediateursCondition}
        )
        SELECT id FROM distinct_lieux
        ORDER BY modification ${sortDirection}, id ASC
        LIMIT ${take} OFFSET ${skip}
      `
    : await prismaClient.$queryRaw<{ id: string }[]>`
        WITH distinct_lieux AS (
          SELECT DISTINCT ON (s.id)
            s.id,
            s.nom
          FROM structures s
          LEFT JOIN mediateurs_en_activite mea ON mea.structure_id = s.id AND mea.suppression IS NULL
          WHERE s.suppression IS NULL
            AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
            AND ${searchCondition}
            AND ${communesCondition}
            AND ${departementsFilterCondition}
            AND ${mediateursCondition}
        )
        SELECT id FROM distinct_lieux
        ORDER BY nom ${sortDirection}, id ASC
        LIMIT ${take} OFFSET ${skip}
      `

  const ids = structureIds.map((row) => row.id)

  // Get total count
  const countResult = await prismaClient.$queryRaw<[{ count: number }]>`
    SELECT COUNT(DISTINCT s.id)::integer AS count
    FROM structures s
    LEFT JOIN mediateurs_en_activite mea ON mea.structure_id = s.id AND mea.suppression IS NULL
    WHERE s.suppression IS NULL
      AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
      AND ${searchCondition}
      AND ${communesCondition}
      AND ${departementsFilterCondition}
      AND ${mediateursCondition}
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
