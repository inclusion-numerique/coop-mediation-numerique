import type { Paginated } from '@arckit/resultset'
import type { Effectif, Tag } from '../../../domain'

type TagListe = {
  readonly tag: Tag
  readonly accompagnements: Effectif
}

export type ListeDesTags = Paginated<TagListe>
