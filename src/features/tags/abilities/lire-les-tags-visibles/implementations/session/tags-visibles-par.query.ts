import { type Acteur, type Tag, TagId } from '../../../../domain'
import { lireLesTagsVisibles } from '../prisma/lire-les-tags-visibles.query'

export const tagsVisiblesPar =
  (acteur: Acteur) =>
  async (tagIds: readonly string[]): Promise<readonly Tag[]> =>
    lireLesTagsVisibles({
      acteur,
      tagIds: tagIds.flatMap((id) => {
        const tagId = TagId.safe(id)
        return tagId === null ? [] : [tagId]
      }),
    })
