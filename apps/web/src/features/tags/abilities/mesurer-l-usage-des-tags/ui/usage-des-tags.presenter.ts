import type { TagAffiche } from '../../../ui/tag-affiche'
import type { TagLePlusUtilise } from '../domain'

export type TagDeLaListe = {
  readonly tag: TagAffiche
  readonly utilisations: number
  readonly accompagnements: number
}

export const tagsDeLaListe = (
  tags: readonly TagLePlusUtilise[],
): readonly TagDeLaListe[] =>
  tags.map((tag) => ({
    tag: {
      id: tag.id,
      nom: tag.nom,
      description: tag.description,
      portee: tag.portee,
      equipe: null,
    },
    utilisations: tag.utilisations,
    accompagnements: tag.accompagnements,
  }))
