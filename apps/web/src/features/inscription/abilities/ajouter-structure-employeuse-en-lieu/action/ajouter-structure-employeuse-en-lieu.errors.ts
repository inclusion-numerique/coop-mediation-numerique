export const AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS = {
  EmployeuseIntrouvable:
    'Aucune structure employeuse n’est rattachée à votre compte',
  AdresseNonReconnue:
    'L’adresse de votre structure employeuse est introuvable dans la Base Adresse Nationale. Vous pouvez l’ajouter comme lieu d’activité à l’étape suivante, en saisissant vous-même son adresse.',
} as const

export type AjouterStructureEmployeuseEnLieuErrorKey =
  (typeof AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS)[keyof typeof AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS]
