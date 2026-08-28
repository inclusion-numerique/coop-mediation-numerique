export const CHOISIR_PROFIL_ERRORS = {
  InscriptionIntrouvable: 'Inscription introuvable',
  InscriptionDejaValidee: 'Votre inscription est déjà validée',
} as const

export type ChoisirProfilErrorKey =
  (typeof CHOISIR_PROFIL_ERRORS)[keyof typeof CHOISIR_PROFIL_ERRORS]
