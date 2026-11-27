import type { Effectif, Tag } from '../../../domain'

export type DestinationDeFusion = {
  readonly tag: Tag
  readonly utilisations: Effectif
}
