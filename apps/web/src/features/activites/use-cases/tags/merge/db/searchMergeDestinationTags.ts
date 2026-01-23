import { SessionUser } from '@app/web/auth/sessionUser'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'
import { Equipe, getEquipeInfo } from '../../equipe'
import { getTagScope, TagScope } from '../../tagScope'
import {
  buildEditableTagsVisibilityClause,
  filterByMergeScope,
  TagRow,
} from './tagVisibility'

type TagRowWithUsage = TagRow & { usageCount: bigint }

type MergeDestinationTagResult = {
  id: string
  nom: string
  description?: string
  scope: TagScope
  accompagnementsCount: number
  equipeNumber?: number
  equipeCoordinateurNom?: string
}

const findTagsWithUsageCount = (
  sessionUser: SessionUser,
  sourceTagId: string,
  visibilityClause: Prisma.Sql,
  recherche: string,
  limit: number,
): Promise<TagRowWithUsage[]> =>
  prismaClient.$queryRaw<TagRowWithUsage[]>`
    SELECT
      t.id,
      t.nom,
      t.description,
      t.mediateur_id as "mediateurId",
      t.coordinateur_id as "coordinateurId",
      t.departement,
      t.equipe,
      COUNT(DISTINCT COALESCE(at.activite_id, act.activite_coordination_id)) AS "usageCount"
    FROM tags t
      LEFT JOIN activite_tags at ON at.tag_id = t.id
      LEFT JOIN activites a ON a.id = at.activite_id
        AND a.mediateur_id = ${sessionUser.mediateur?.id ?? null}::UUID
        AND a.suppression IS NULL
      LEFT JOIN activite_coordination_tags act ON act.tag_id = t.id
      LEFT JOIN activite_coordination ac ON ac.id = act.activite_coordination_id
        AND ac.coordinateur_id = ${sessionUser.coordinateur?.id ?? null}::UUID
        AND ac.suppression IS NULL
    WHERE
      t.suppression IS NULL
      AND t.id != ${sourceTagId}::UUID
      ${recherche ? Prisma.sql`AND t.nom ILIKE ${`%${recherche}%`}` : Prisma.empty}
      AND ${visibilityClause}
    GROUP BY t.id
    ORDER BY "usageCount" DESC, t.nom ASC
    LIMIT ${limit}
  `

const toMergeDestinationTag =
  (equipes: Equipe[]) =>
  (tag: TagRowWithUsage): MergeDestinationTagResult => ({
    id: tag.id,
    nom: tag.nom,
    description: tag.description ?? undefined,
    scope: getTagScope(tag),
    accompagnementsCount: Number(tag.usageCount),
    ...getEquipeInfo(equipes, tag.coordinateurId, tag.equipe),
  })

const findMergeDestinationTags = async (
  sessionUser: SessionUser,
  sourceTagId: string,
  recherche: string,
  limit: number,
): Promise<{ items: MergeDestinationTagResult[]; sourceScope?: TagScope }> => {
  const sourceTag = await prismaClient.tag.findUnique({
    where: { id: sourceTagId },
  })

  if (!sourceTag) return { items: [] }

  const sourceScope = getTagScope(sourceTag)
  const { clause: visibilityClause, equipes } =
    buildEditableTagsVisibilityClause(sessionUser)

  if (!visibilityClause) return { items: [] }

  const tags = await findTagsWithUsageCount(
    sessionUser,
    sourceTagId,
    visibilityClause,
    recherche,
    limit,
  )

  const items = tags
    .filter(filterByMergeScope(sourceScope))
    .map(toMergeDestinationTag(equipes))

  return { items, sourceScope }
}

export const searchMergeDestinationTags = (
  sessionUser: SessionUser,
  {
    sourceTagId,
    query,
    limit = 10,
  }: { sourceTagId: string; query: string; limit?: number },
) => findMergeDestinationTags(sessionUser, sourceTagId, query.trim(), limit)

export const getDefaultMergeDestinationTags = (
  sessionUser: SessionUser,
  sourceTagId: string,
  limit = 5,
) => findMergeDestinationTags(sessionUser, sourceTagId, '', limit)
