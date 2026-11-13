import type { Effectif, LieuActiviteId, NomDeStructure } from '../../../domain'

export type AccompagnementsParLieu = readonly {
  readonly lieu: { readonly id: LieuActiviteId; readonly nom: NomDeStructure }
  readonly nombre: Effectif
}[]
