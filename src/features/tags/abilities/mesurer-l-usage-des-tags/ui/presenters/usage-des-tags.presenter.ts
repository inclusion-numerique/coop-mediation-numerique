import { badgeDePortee } from '../../../../ui/presenters/badge-de-portee.presenter'
import type { TagAffiche } from '../../../../ui/presenters/tag-affiche.presenter'
import type { TagLePlusUtilise } from '../../domain/index'

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
      badge: badgeDePortee(tag.portee, null),
    },
    utilisations: tag.utilisations,
    accompagnements: tag.accompagnements,
  }))
