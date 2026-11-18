export const VALIDER_ERRORS = {
  ProfilNonChoisi:
    'Vous devez choisir un profil avant de valider votre inscription',
  InscriptionDejaValidee: 'Votre inscription est déjà validée',
  CompteDeRoleIntrouvable:
    'Impossible de valider une inscription sans profil médiateur ou coordinateur',
} as const

export type ValiderErrorKey =
  (typeof VALIDER_ERRORS)[keyof typeof VALIDER_ERRORS]
