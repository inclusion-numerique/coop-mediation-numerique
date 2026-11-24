import type { Acteur, Tag, TypeDePortee } from '../../domain'
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
}

export const tagAffiche =
  (acteur: Acteur) =>
  (tag: Tag): TagAffiche => ({
    id: tag.id,
    nom: tag.nom,
    description: tag.description,
    portee: tag.portee._tag,
    equipe: equipeAffichee(acteur)(tag.portee),
  })
