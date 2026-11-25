import { type Acteur, TagId } from '../../../../domain'
import { rechercherDesTags } from './rechercher-des-tags.query'

type TagTrouve = Awaited<ReturnType<typeof rechercherDesTags>>[number]

export const tagsInitiauxAvec =
  <Affiche>(presenter: (acteur: Acteur) => (tag: TagTrouve) => Affiche) =>
  (acteur: Acteur) =>
  async (exclus: readonly string[]): Promise<readonly Affiche[]> => {
    const tags = await rechercherDesTags({
      acteur,
      recherche: '',
      exclus: exclus.flatMap((id) => {
        const tagId = TagId.safe(id)
        return tagId === null ? [] : [tagId]
      }),
      limite: 10,
    })
    return tags.map(presenter(acteur))
  }
