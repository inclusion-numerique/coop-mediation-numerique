import { SessionUser } from '@app/web/auth/sessionUser'
import { prismaClient } from '@app/web/prismaClient'
import { Equipe, getEquipeInfo } from '../../equipe'
import { getTagScope, TagScope } from '../../tagScope'
import {
  buildAllVisibleTagsVisibilityClause,
  canMergeToScope,
  filterByMergeScope,
  TagRow,
} from './tagVisibility'

export { canMergeToScope }

type AvailableDestinationTag = {
  id: string
  nom: string
  description?: string
  scope: TagScope
  equipeNumber?: number
  equipeCoordinateurNom?: string
}

const findAvailableTags = (
  sourceTagId: string,
  visibilityClause: ReturnType<
    typeof buildAllVisibleTagsVisibilityClause
  >['clause'],
): Promise<TagRow[]> =>
  prismaClient.$queryRaw<TagRow[]>`
    SELECT
      t.id,
      t.nom,
      t.description,
      t.mediateur_id as "mediateurId",
      t.coordinateur_id as "coordinateurId",
      t.departement,
      t.equipe
    FROM tags t
    WHERE
      t.suppression IS NULL
      AND t.id != ${sourceTagId}::UUID
      AND ${visibilityClause}
    ORDER BY t.nom ASC
  `

const toAvailableDestinationTag =
  (equipes: Equipe[]) =>
  (tag: TagRow): AvailableDestinationTag => ({
    id: tag.id,
    nom: tag.nom,
    description: tag.description ?? undefined,
    scope: getTagScope(tag),
    ...getEquipeInfo(equipes, tag.coordinateurId, tag.equipe),
  })

export const getAvailableDestinationTags = async (
  sessionUser: SessionUser,
  sourceTagId: string,
) => {
  const sourceTag = await prismaClient.tag.findUnique({
    where: { id: sourceTagId },
  })

  if (!sourceTag) return { items: [] }

  const sourceScope = getTagScope(sourceTag)
  const { clause: visibilityClause, equipes } =
    buildAllVisibleTagsVisibilityClause(sessionUser)

  const tags = await findAvailableTags(sourceTagId, visibilityClause)

  const items = tags
    .filter(filterByMergeScope(sourceScope))
    .map(toAvailableDestinationTag(equipes))

  return {
    items,
    sourceTag: {
      id: sourceTag.id,
      nom: sourceTag.nom,
      scope: sourceScope,
    },
  }
}
