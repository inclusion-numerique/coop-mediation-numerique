export const RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS = {
  InscriptionIntrouvable: 'Inscription introuvable',
  ProfilNonChoisi: 'Veuillez d’abord choisir votre rôle',
  InscriptionDejaValidee: 'Votre inscription est déjà validée',
} as const

export type RenseignerStructureEmployeuseErrorKey =
  (typeof RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS)[keyof typeof RENSEIGNER_STRUCTURE_EMPLOYEUSE_ERRORS]
