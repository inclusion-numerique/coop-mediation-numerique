import type { Acteur, Tag } from '../domain'
import { equipeAffichee } from './equipe-affichee.presenter'
import type { TagAffiche } from './tag-affiche'

export const tagAffiche =
  (acteur: Acteur) =>
  (tag: Tag): TagAffiche => ({
    id: tag.id,
    nom: tag.nom,
    description: tag.description,
    portee: tag.portee._tag,
    equipe: equipeAffichee(acteur)(tag.portee),
  })
