import { contientSansAccent } from '@/libraries/texte'
import type { Tag } from '../../../domain'

const TAGS_TROUVES = 10

export const tagsRecherches = (
  tags: readonly Tag[],
  recherche: string,
): readonly Tag[] =>
  tags
    .filter(({ nom }) => contientSansAccent(nom, recherche))
    .slice(0, TAGS_TROUVES)
