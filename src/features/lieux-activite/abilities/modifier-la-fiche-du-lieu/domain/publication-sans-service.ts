import type { Lieu } from '../../../domain/lieu'
import { publicationSansService } from '../../../domain/publication'
import { estPublie } from '../../../domain/visibilite-cartographie'
import type { ModificationLieu } from './modification-lieu'

export const laisseUnePublicationSansService = (
  lieu: Lieu,
  { section }: ModificationLieu,
): boolean =>
  section === 'ServicesEtAccompagnement' &&
  publicationSansService(estPublie(lieu.visibilite), lieu.fiche.services)
