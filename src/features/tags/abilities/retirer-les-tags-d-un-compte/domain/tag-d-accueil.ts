import { memeNom, type NomDuTag, type TagId } from '../../../domain'

export type TagDetenu = {
  readonly id: TagId
  readonly nom: NomDuTag
}

export const tagDAccueil = (
  detenus: readonly TagDetenu[],
  nom: NomDuTag,
): TagId | null =>
  detenus.find((detenu) => memeNom(detenu.nom, nom))?.id ?? null
