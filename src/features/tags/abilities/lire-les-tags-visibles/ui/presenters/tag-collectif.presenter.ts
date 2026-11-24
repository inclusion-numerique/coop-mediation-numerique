import type { Tag } from '../../../../domain'

export const tagCollectifAffiche = ({ id, nom, description, portee }: Tag) => ({
  id,
  nom,
  description,
  portee: portee._tag,
  equipe: null,
})
