import { estPublie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import type { Lieu } from '../../../domain/lieu'
import type { ModificationLieu } from './modification-lieu'

export const laisseUnePublicationSansAdresse = (
  lieu: Lieu,
  { section }: ModificationLieu,
): boolean =>
  section === 'VisibiliteCartographie' &&
  estPublie(lieu.visibilite) &&
  lieu.banId == null
