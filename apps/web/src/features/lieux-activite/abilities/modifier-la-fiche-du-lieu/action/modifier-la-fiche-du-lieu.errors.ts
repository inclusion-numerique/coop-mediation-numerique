import { PUBLICATION_SANS_SERVICE } from '@app/web/features/lieux-activite/domain/publication'

export const MODIFIER_LA_FICHE_DU_LIEU_ERRORS = {
  FicheIntrouvable: 'Ce lieu d’activité n’existe pas ou a été supprimé',
  PublicationSansService: PUBLICATION_SANS_SERVICE,
} as const

export type ModifierLaFicheDuLieuErrorKey =
  (typeof MODIFIER_LA_FICHE_DU_LIEU_ERRORS)[keyof typeof MODIFIER_LA_FICHE_DU_LIEU_ERRORS]
