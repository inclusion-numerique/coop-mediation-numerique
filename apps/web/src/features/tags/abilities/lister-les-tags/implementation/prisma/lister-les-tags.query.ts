import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { type TagRow, tagToDomain } from '../../../../db/tag.transfer'
import {
  COLONNES_DU_TAG,
  ORDRE_ALPHABETIQUE,
  ORDRE_DE_VISIBILITE,
  TAGS,
  tagVisiblePar,
} from '../../../../db/visibilite.sql'
import { type Acteur, Effectif } from '../../../../domain'
import type { ListeDesTags, TriDesTags } from '../../domain'

const ordre = (tri: TriDesTags): Prisma.Sql =>
  tri === 'visibilite' ? ORDRE_DE_VISIBILITE : ORDRE_ALPHABETIQUE

export const listerLesTags = async ({
  acteur,
  tri,
  page,
  lignesParPage,
}: {
  readonly acteur: Acteur
  readonly tri: TriDesTags
  readonly page: number
  readonly lignesParPage: number
}): Promise<ListeDesTags> => {
  const visibles = Prisma.sql`t.suppression IS NULL AND ${tagVisiblePar(acteur)}`

  const [lignes, [{ total }]] = await Promise.all([
    prismaClient.$queryRaw<(TagRow & { accompagnements: number })[]>`
      SELECT ${COLONNES_DU_TAG}, t.accompagnements_count AS accompagnements
      FROM ${TAGS}
      WHERE ${visibles}
      ORDER BY ${ordre(tri)}
      LIMIT ${lignesParPage}
      OFFSET ${(Math.max(page, 1) - 1) * lignesParPage}
    `,
    prismaClient.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) AS total FROM ${TAGS} WHERE ${visibles}
    `,
  ])

  return {
    tags: lignes.flatMap((ligne) => {
      const tag = tagToDomain(ligne)
      return tag === null
        ? []
        : [{ tag, accompagnements: Effectif(ligne.accompagnements) }]
    }),
    total: Effectif(Number(total)),
  }
}
