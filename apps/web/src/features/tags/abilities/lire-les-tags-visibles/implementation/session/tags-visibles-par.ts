import type { SessionUser } from '@app/web/auth/sessionUser'
import { type Tag, TagId } from '../../../../domain'
import { acteurDe } from '../../../../implementation/session'
import {
  lireLesTagsVisibles,
  lireTousLesTagsVisibles,
} from '../prisma/lire-les-tags-visibles.query'

export const tagsVisiblesPar =
  (user: SessionUser) =>
  async (tagIds: readonly string[]): Promise<readonly Tag[]> =>
    lireLesTagsVisibles({
      acteur: acteurDe(user),
      tagIds: tagIds.flatMap((id) => {
        const tagId = TagId.safe(id)
        return tagId === null ? [] : [tagId]
      }),
    })

export const tousLesTagsVisiblesPar = (
  user: SessionUser,
): Promise<readonly Tag[]> =>
  lireTousLesTagsVisibles({ acteur: acteurDe(user) })
