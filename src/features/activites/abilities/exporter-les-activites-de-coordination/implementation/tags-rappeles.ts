import type {
  CriteresDesCoordinations,
  TagDeLActivite,
  TagsUtilisables,
} from '../../../domain'

export const tagsRappeles = async ({
  criteres,
  tagsUtilisables,
}: {
  readonly criteres: CriteresDesCoordinations
  readonly tagsUtilisables: TagsUtilisables
}): Promise<readonly TagDeLActivite[]> =>
  criteres.tags.length === 0 ? [] : tagsUtilisables(criteres.tags)
