import type { ActeurId, CoordinateurId } from '../../../domain'

export type QuiConsulte = {
  readonly id: string
  readonly coordinateur: { readonly id: string } | null
}

export type Lecteur =
  | {
      readonly _tag: 'Coordinateur'
      readonly acteurId: ActeurId
      readonly coordinateurId: CoordinateurId
    }
  | { readonly _tag: 'Mediateur'; readonly acteurId: ActeurId }
