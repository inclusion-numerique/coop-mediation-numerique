import type { SessionUser } from '@app/web/auth/sessionUser'
import { TagId } from '../../../../domain'
import { acteurDe } from '../../../../implementation/session'
import type { TagAffiche } from '../../../../ui/tag-affiche'
import { tagAffiche } from '../../../../ui/tag-affiche.presenter'
import { rechercherDesTags } from '../prisma'

export const tagsInitiauxPar =
  (user: SessionUser) =>
  async (exclus: readonly string[]): Promise<readonly TagAffiche[]> => {
    const acteur = acteurDe(user)
    const tags = await rechercherDesTags({
      acteur,
      recherche: '',
      exclus: exclus.flatMap((id) => {
        const tagId = TagId.safe(id)
        return tagId === null ? [] : [tagId]
      }),
      limite: 10,
    })
    return tags.map(tagAffiche(acteur))
  }
