import type { Page, PageSize, Sort, SortDirection } from '@arckit/resultset'
import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { type Acteur, Effectif } from '../../../../domain'
import {
  type TagRow,
  tagToDomain,
} from '../../../../implementations/prisma/tag.transfer'
import {
  COLONNES_DU_TAG,
  TAGS,
  tagVisiblePar,
} from '../../../../implementations/prisma/visibilite.sql'
import type { ColonneDesTags, ListeDesTags } from '../../domain'

const SENS: Record<SortDirection, Prisma.Sql> = {
  asc: Prisma.sql`ASC`,
  desc: Prisma.sql`DESC`,
}

const ordre = ({ field, direction }: Sort<ColonneDesTags>): Prisma.Sql =>
  field === 'visibilite'
    ? Prisma.sql`t.departement ${SENS[direction]}, t.mediateur_id ${SENS[direction]}, t.coordinateur_id ${SENS[direction]}, t.nom ASC`
    : Prisma.sql`t.nom ${SENS[direction]}`

export const listerLesTags = async ({
  acteur,
  tri,
  page,
  pageSize,
}: {
  readonly acteur: Acteur
  readonly tri: Sort<ColonneDesTags>
  readonly page: Page
  readonly pageSize: PageSize
}): Promise<ListeDesTags> => {
  const visibles = Prisma.sql`t.suppression IS NULL AND ${tagVisiblePar(acteur)}`

  const [lignes, [{ total }]] = await Promise.all([
    prismaClient.$queryRaw<(TagRow & { accompagnements: number })[]>`
      SELECT ${COLONNES_DU_TAG}, t.accompagnements_count AS accompagnements
      FROM ${TAGS}
      WHERE ${visibles}
      ORDER BY ${ordre(tri)}
      LIMIT ${pageSize}
      OFFSET ${(page - 1) * pageSize}
    `,
    prismaClient.$queryRaw<[{ total: bigint }]>`
      SELECT COUNT(*) AS total FROM ${TAGS} WHERE ${visibles}
    `,
  ])

  return {
    items: lignes.map((ligne) => ({
      tag: tagToDomain(ligne),
      accompagnements: Effectif(ligne.accompagnements),
    })),
    totalItems: Number(total),
    currentPage: page,
    pageSize,
  }
}
