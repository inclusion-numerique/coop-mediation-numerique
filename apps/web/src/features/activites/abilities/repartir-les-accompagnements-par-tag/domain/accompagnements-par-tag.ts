import type { Effectif, NomDeTag, TagId } from '../../../domain'

export type AccompagnementsDuTag = {
  readonly tag: { readonly id: TagId; readonly nom: NomDeTag }
  readonly nombre: Effectif
}

export type AccompagnementsParTag = readonly AccompagnementsDuTag[]
