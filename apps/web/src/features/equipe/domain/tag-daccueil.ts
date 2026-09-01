import { memeNom, type NomTag } from './nom-tag'
import type { TagId } from './tag-id'

export type TagExistant = {
  readonly id: TagId
  readonly nom: NomTag
}

/**
 * Le tag qui doit accueillir les comptes rendus repris, parmi ceux que le
 * médiateur détient déjà.
 *
 * `null` veut dire « il faut en créer un ». Réutiliser plutôt que dupliquer
 * n'est pas une optimisation : sans cette règle, un essaimage laisserait deux
 * entrées de même nom dans la liste de quelqu'un, sans moyen de les distinguer.
 */
export const tagDAccueil = (
  detenus: readonly TagExistant[],
  nom: NomTag,
): TagId | null =>
  detenus.find((detenu) => memeNom(detenu.nom, nom))?.id ?? null
