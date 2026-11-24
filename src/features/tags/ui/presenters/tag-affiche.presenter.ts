import type { Acteur, Tag, TypeDePortee } from '../../domain'
import { type BadgeDePortee, badgeDePortee } from './badge-de-portee.presenter'
import {
  type EquipeAffichee,
  equipeAffichee,
} from './equipe-affichee.presenter'

export type TagAffiche = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly portee: TypeDePortee
  readonly equipe: EquipeAffichee | null
  readonly badge: BadgeDePortee
}

export const tagAffiche =
  (acteur: Acteur) =>
  (tag: Tag): TagAffiche => {
    const equipe = equipeAffichee(acteur)(tag.portee)
    return {
      id: tag.id,
      nom: tag.nom,
      description: tag.description,
      portee: tag.portee._tag,
      equipe,
      badge: badgeDePortee(tag.portee._tag, equipe),
    }
  }
