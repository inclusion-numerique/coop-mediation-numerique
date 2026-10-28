import type { Tag } from '../../../domain'

export type TagListe = {
  readonly tag: Tag
  readonly accompagnements: number
}

export type ListeDesTags = {
  readonly tags: readonly TagListe[]
  readonly total: number
}
