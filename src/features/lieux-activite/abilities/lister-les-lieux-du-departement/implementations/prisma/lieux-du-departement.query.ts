import type { Page, PageSize, Paginated, Sort } from '@arckit/resultset'
import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { orderItemsByIndexedValues } from '@/libraries/collections'
import type { LieuEnListe } from '../../../../domain/lieu-en-liste'
import type { ColonneDesLieux } from '../../../../domain/tri-des-lieux'
import {
  lieuEnListe,
  projectionDuLieuEnListe,
} from '../../../../implementations/prisma/lieu-en-liste.select'
import {
  DERNIERE_ECRITURE,
  JOINTURE_DE_L_INSCRIPTION,
  NOM_AFFICHE,
  normaliseePourLaRecherche,
  VOIE_DU_REGISTRE,
} from '../../../../implementations/prisma/registre/lieu-affiche.sql'
import { lieuALAnnuaireDuDepartement } from './lieu-a-l-annuaire.sql'

const EXPRESSION_DE_TRI = {
  nom: NOM_AFFICHE,
  modification: DERNIERE_ECRITURE,
} satisfies Record<
  ColonneDesLieux,
  ReturnType<typeof normaliseePourLaRecherche>
>

type CriteresDesLieuxDuDepartement = {
  readonly recherche: string
  readonly communes: readonly string[]
  readonly tri: Sort<ColonneDesLieux>
  readonly page: Page
  readonly pageSize: PageSize
}

export type LieuxDuDepartementOptions = {
  departementCode: string
  criteres: CriteresDesLieuxDuDepartement
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

  return lieux.map(lieuEnListe)
}

export const lieuxDuDepartement = async ({
  departementCode,
  criteres: { recherche, communes, tri, page, pageSize },
}: LieuxDuDepartementOptions): Promise<Paginated<LieuEnListe>> => {
  const searchTerm = recherche.trim()
  const normalizedSearchTerm = searchTerm
    ? Prisma.sql`NULLIF(regexp_replace(lower(unaccent(${searchTerm})), '[\\s-]', '', 'g'), '')`
    : null

  const searchCondition = normalizedSearchTerm
    ? Prisma.sql`(
        ${normaliseePourLaRecherche(Prisma.sql`s.nom`)} ILIKE '%' || ${normalizedSearchTerm} || '%'
        OR ${normaliseePourLaRecherche(Prisma.sql`ri.nom`)} ILIKE '%' || ${normalizedSearchTerm} || '%'
        OR ${normaliseePourLaRecherche(Prisma.sql`s.adresse`)} ILIKE '%' || ${normalizedSearchTerm} || '%'
        OR ${normaliseePourLaRecherche(VOIE_DU_REGISTRE)} ILIKE '%' || ${normalizedSearchTerm} || '%'
        OR s.siret ILIKE '%' || ${searchTerm} || '%'
        OR s.code_postal ILIKE '%' || ${searchTerm} || '%'
        OR ra.code_postal ILIKE '%' || ${searchTerm} || '%'
      )`
    : Prisma.sql`TRUE`

  const communesCondition =
    communes.length > 0
      ? Prisma.sql`s.code_insee = ANY(${[...communes]}::TEXT[])`
      : Prisma.sql`TRUE`

  const sortColumn = EXPRESSION_DE_TRI[tri.field]
  const sortDirection = Prisma.raw(tri.direction === 'desc' ? 'DESC' : 'ASC')

  const structureIds = await prismaClient.$queryRaw<{ id: string }[]>`
    WITH distinct_lieux AS (
      SELECT DISTINCT ON (s.id)
        s.id,
        ${sortColumn} AS tri
      FROM lieu_inclusion s
      ${JOINTURE_DE_L_INSCRIPTION}
      WHERE ${lieuALAnnuaireDuDepartement(departementCode)}
        AND ${searchCondition}
        AND ${communesCondition}
    )
    SELECT id FROM distinct_lieux
    ORDER BY tri ${sortDirection}, id ASC
    LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
  `

  const ids = structureIds.map((row) => row.id)

  const countResult = await prismaClient.$queryRaw<[{ count: number }]>`
    SELECT COUNT(DISTINCT s.id)::integer AS count
    FROM lieu_inclusion s
    ${JOINTURE_DE_L_INSCRIPTION}
    WHERE ${lieuALAnnuaireDuDepartement(departementCode)}
      AND ${searchCondition}
      AND ${communesCondition}
  `

  const totalCount = countResult[0]?.count ?? 0

  const lieux = ids.length > 0 ? await getLieuxByIds({ ids }) : []

  const orderedLieux = orderItemsByIndexedValues(lieux, ids)

  return {
    items: orderedLieux,
    totalItems: totalCount,
    currentPage: page,
    pageSize,
  }
}
