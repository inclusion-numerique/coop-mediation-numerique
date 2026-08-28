export const CREER_LIEU_ACTIVITE_ERRORS = {
  MediateurIntrouvable:
    'Vous devez être médiateur pour ajouter un lieu d’activité',
} as const

export type CreerLieuActiviteErrorKey =
  (typeof CREER_LIEU_ACTIVITE_ERRORS)[keyof typeof CREER_LIEU_ACTIVITE_ERRORS]
