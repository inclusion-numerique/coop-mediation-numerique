import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { type TagRow, tagToDomain } from '../../../../db/tag.transfer'
import {
  COLONNES_DU_TAG,
  TAGS,
  tagVisiblePar,
} from '../../../../db/visibilite.sql'
import {
  type Acteur,
  coordinateurDe,
  mediateurDe,
  type Tag,
  type TagId,
} from '../../../../domain'

const utilisationsPar = (acteur: Acteur): Prisma.Sql =>
  Prisma.sql`
    (SELECT COUNT(*) FROM activite_tags at
      JOIN activites a ON a.id = at.activite_id
      WHERE at.tag_id = t.id
        AND a.suppression IS NULL
        AND a.mediateur_id = ${mediateurDe(acteur)}::UUID)
    + (SELECT COUNT(*) FROM activite_coordination_tags act
      JOIN activite_coordination ac ON ac.id = act.activite_coordination_id
      WHERE act.tag_id = t.id
        AND ac.suppression IS NULL
        AND ac.coordinateur_id = ${coordinateurDe(acteur)}::UUID)`

export const rechercherDesTags = async ({
  acteur,
  recherche,
  exclus,
  limite,
}: {
  readonly acteur: Acteur
  readonly recherche: string
  readonly exclus: readonly TagId[]
  readonly limite: number
}): Promise<readonly Tag[]> => {
  const lignes = await prismaClient.$queryRaw<TagRow[]>`
    SELECT ${COLONNES_DU_TAG}
    FROM ${TAGS}
    WHERE t.suppression IS NULL
      AND t.nom ILIKE ${`%${recherche.trim()}%`}
      AND ${tagVisiblePar(acteur)}
      ${
        exclus.length === 0
          ? Prisma.empty
          : Prisma.sql`AND t.id NOT IN (${Prisma.join(exclus.map((id) => Prisma.sql`${id}::UUID`))})`
      }
    ORDER BY ${utilisationsPar(acteur)} DESC, t.nom ASC
    LIMIT ${limite}
  `

  return lignes.flatMap((ligne) => {
    const tag = tagToDomain(ligne)
    return tag === null ? [] : [tag]
  })
}
