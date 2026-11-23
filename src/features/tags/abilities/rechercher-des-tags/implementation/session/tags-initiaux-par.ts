import { type Acteur, TagId } from '../../../../domain'
import type { TagAffiche } from '../../../../ui/tag-affiche'
import { tagAffiche } from '../../../../ui/tag-affiche.presenter'
import { rechercherDesTags } from '../prisma'

export const tagsInitiauxPar =
  (acteur: Acteur) =>
  async (exclus: readonly string[]): Promise<readonly TagAffiche[]> => {
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
