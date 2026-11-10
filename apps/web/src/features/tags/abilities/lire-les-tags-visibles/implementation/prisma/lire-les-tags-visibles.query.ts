import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { type TagRow, tagToDomain } from '../../../../db/tag.transfer'
import {
  COLONNES_DU_TAG,
  TAGS,
  tagVisiblePar,
} from '../../../../db/visibilite.sql'
import type { Acteur, Tag, TagId } from '../../../../domain'

export const lireLesTagsVisibles = async ({
  acteur,
  tagIds,
}: {
  readonly acteur: Acteur
  readonly tagIds: readonly TagId[]
}): Promise<readonly Tag[]> => {
  if (tagIds.length === 0) return []

  const lignes = await prismaClient.$queryRaw<TagRow[]>`
    SELECT ${COLONNES_DU_TAG}
    FROM ${TAGS}
    WHERE t.suppression IS NULL
      AND t.id IN (${Prisma.join(tagIds.map((id) => Prisma.sql`${id}::UUID`))})
      AND ${tagVisiblePar(acteur)}
  `

  return lignes.flatMap((ligne) => {
    const tag = tagToDomain(ligne)
    return tag === null ? [] : [tag]
  })
}
