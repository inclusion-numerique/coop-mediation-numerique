import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { DEFAULT_PAGE, toNumberOr } from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { departementCodeFromInseeRegex } from '@app/web/utils/departementCodeFromInseeRegex'
import { orderItemsByIndexedValues } from '@app/web/utils/orderItemsByIndexedValues'
import { Prisma } from '@prisma/client'
import {
  type LieuEnListe,
  projectionDuLieuEnListe,
} from '../../../../db/lieu-en-liste'
import { ordonnancement, type TriDeLAnnuaire } from '../../domain'

const LIEUX_DEFAULT_PAGE_SIZE = 20

/**
 * Ce que l'annuaire peut demander : un département, un texte libre, des
 * communes, des départements de repli, des médiateurs, un tri et une page.
 * Déclaré ici plutôt qu'emprunté à la page qui les lit dans l'URL — la requête
 * ne dépend pas de l'écran qui la déclenche.
 */
export type RechercheDeLieuxDuDepartement = {
  readonly recherche?: string
  readonly communes?: readonly string[]
  readonly departements?: readonly string[]
  readonly mediateurs?: readonly string[]
  readonly tri?: TriDeLAnnuaire
  readonly page?: string
  readonly lignes?: string
}

export type LieuxDuDepartementOptions = {
  departementCode: string
  searchParams: RechercheDeLieuxDuDepartement
}

const getLieuxByIds = async ({
  ids,
}: {
  ids: string[]
}): Promise<LieuEnListe[]> => {
  const lieux = await prismaClient.lieuInclusion.findMany({
    where: { id: { in: ids } },
    select: projectionDuLieuEnListe,
  })

  return lieux
}

/**
 * L'annuaire d'un département ne montre pas tous les lieux qui s'y trouvent :
 * un lieu y figure s'il est publié sur la cartographie nationale, ou si au
 * moins un médiateur y exerce encore. Un lieu ni publié ni fréquenté n'est
 * l'annuaire de personne.
 *
 * Les identifiants sont paginés en SQL brut — le `DISTINCT` que réclame la
 * jointure avec les rattachements ne se dit pas avec l'API de Prisma — puis
 * hydratés par Prisma, et remis dans l'ordre que le SQL a fixé.
 */
export const lieuxDuDepartement = async ({
  departementCode,
  searchParams,
}: LieuxDuDepartementOptions) => {
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
      ? Prisma.sql`s.code_insee = ANY(${[...searchParams.communes]}::TEXT[])`
      : Prisma.sql`TRUE`

  // Departements filter (within location, not the main department context)
  const departementsFilterCondition =
    searchParams.departements && searchParams.departements.length > 0
      ? Prisma.sql`SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ANY(${[...searchParams.departements]}::TEXT[])`
      : Prisma.sql`TRUE`

  // Build mediateurs filter condition
  const mediateursCondition =
    searchParams.mediateurs && searchParams.mediateurs.length > 0
      ? Prisma.sql`mea.mediateur_id = ANY(${[...searchParams.mediateurs]}::UUID[])`
      : Prisma.sql`TRUE`

  const { colonne, sens } = ordonnancement(searchParams.tri)
  const sortColumn = Prisma.raw(colonne)
  const sortDirection = Prisma.raw(sens)

  // Get paginated structure IDs using CTE to handle DISTINCT + ORDER BY
  const structureIds = await prismaClient.$queryRaw<{ id: string }[]>`
    WITH distinct_lieux AS (
      SELECT DISTINCT ON (s.id)
        s.id,
        s.${sortColumn}
      FROM lieu_inclusion s
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
    FROM lieu_inclusion s
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

export type LieuxDuDepartement = Awaited<ReturnType<typeof lieuxDuDepartement>>
