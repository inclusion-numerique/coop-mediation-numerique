export const RENSEIGNER_LIEUX_ACTIVITE_ERRORS = {
  InscriptionIntrouvable: 'Inscription introuvable',
  ProfilNonChoisi:
    'Vous devez choisir un profil avant de renseigner vos lieux d’activité',
  InscriptionDejaValidee: 'Votre inscription est déjà validée',
} as const

export type RenseignerLieuxActiviteErrorKey =
  (typeof RENSEIGNER_LIEUX_ACTIVITE_ERRORS)[keyof typeof RENSEIGNER_LIEUX_ACTIVITE_ERRORS]
