export const MODIFIER_LA_FICHE_DU_LIEU_ERRORS = {
  FicheIntrouvable: 'Ce lieu d’activité n’existe pas ou a été supprimé',
} as const

export type ModifierLaFicheDuLieuErrorKey =
  (typeof MODIFIER_LA_FICHE_DU_LIEU_ERRORS)[keyof typeof MODIFIER_LA_FICHE_DU_LIEU_ERRORS]
