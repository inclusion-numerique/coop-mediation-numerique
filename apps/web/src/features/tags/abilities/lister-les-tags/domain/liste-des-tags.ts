import type { Effectif, Tag } from '../../../domain'

export type TagListe = {
  readonly tag: Tag
  readonly accompagnements: Effectif
}

export type ListeDesTags = {
  readonly tags: readonly TagListe[]
  readonly total: Effectif
}
