import { failure, type Result, success } from '@/libraries/result'
import type { TagDeLActivite } from '../coordination/activite-de-coordination'
import { TagInutilisable } from '../errors'
import type { TagId } from '../identifiants/tag-id'

export type TagsUtilisables = (
  tagIds: readonly TagId[],
) => Promise<readonly TagDeLActivite[]>

export const tagsDeLaSaisie = (
  choisis: readonly TagId[],
  utilisables: readonly TagDeLActivite[],
): Result<readonly TagDeLActivite[], TagInutilisable> => {
  const tags = choisis.flatMap((tagId) =>
    utilisables.filter(({ id }) => id === tagId),
  )
  return tags.length === new Set(choisis).size
    ? success(tags)
    : failure(TagInutilisable())
}
