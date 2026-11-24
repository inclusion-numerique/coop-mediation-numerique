import {
  PUBLICATION_SANS_ADRESSE,
  PUBLICATION_SANS_SERVICE,
} from '@/features/lieux-activite/domain/registre/publication'

export const MODIFIER_LA_FICHE_DU_LIEU_ERRORS = {
  FicheIntrouvable: 'Ce lieu d’activité n’existe pas ou a été supprimé',
  PublicationSansService: PUBLICATION_SANS_SERVICE,
  PublicationSansAdresse: PUBLICATION_SANS_ADRESSE,
} as const
