import { memeNom, type NomTag } from './nom-tag'
import type { TagId } from './tag-id'

export type TagExistant = {
  readonly id: TagId
  readonly nom: NomTag
}

export const tagDAccueil = (
  detenus: readonly TagExistant[],
  nom: NomTag,
): TagId | null =>
  detenus.find((detenu) => memeNom(detenu.nom, nom))?.id ?? null
