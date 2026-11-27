import {
  estPublie,
  type VisibiliteCartographie,
} from '../cartographie-nationale/visibilite-cartographie'

export type EcritureAuRegistre = 'FicheComplete' | 'IdentiteSeule'

export const ecritureALaCreation = (
  visibilite: VisibiliteCartographie,
): EcritureAuRegistre =>
  estPublie(visibilite) ? 'FicheComplete' : 'IdentiteSeule'
