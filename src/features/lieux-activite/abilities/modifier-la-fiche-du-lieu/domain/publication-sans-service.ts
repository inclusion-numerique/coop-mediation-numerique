import { estPublie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import type { Lieu } from '../../../domain/lieu'
import { publicationSansService } from '../../../domain/registre/publication'
import type { ModificationLieu } from './modification-lieu'

export const laisseUnePublicationSansService = (
  lieu: Lieu,
  { section }: ModificationLieu,
): boolean =>
  section === 'ServicesEtAccompagnement' &&
  publicationSansService(estPublie(lieu.visibilite), lieu.fiche.services)
