import {
  estPublie,
  type VisibiliteCartographie,
} from '../cartographie-nationale/visibilite-cartographie'

export type EcritureAuRegistre =
  | { readonly _tag: 'FicheComplete' }
  | { readonly _tag: 'IdentiteSeule' }

export const FicheComplete: EcritureAuRegistre = { _tag: 'FicheComplete' }

export const IdentiteSeule: EcritureAuRegistre = { _tag: 'IdentiteSeule' }

export const ecritureALaCreation = (
  visibilite: VisibiliteCartographie,
): EcritureAuRegistre => (estPublie(visibilite) ? FicheComplete : IdentiteSeule)
