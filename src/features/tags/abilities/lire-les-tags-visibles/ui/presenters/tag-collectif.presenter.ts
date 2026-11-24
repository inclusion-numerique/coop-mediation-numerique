import type { Tag } from '../../../../domain'
import { badgeDePortee } from '../../../../ui/presenters/badge-de-portee.presenter'

export const tagCollectifAffiche = ({ id, nom, description, portee }: Tag) => ({
  id,
  nom,
  description,
  portee: portee._tag,
  equipe: null,
  badge: badgeDePortee(portee._tag, null),
})
