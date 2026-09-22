export const AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS = {
  EmployeuseIntrouvable:
    'Aucune structure employeuse n’est rattachée à votre compte',
  AdresseNonReconnue:
    'L’adresse de votre structure employeuse est introuvable dans la Base Adresse Nationale. Contactez le support pour ajouter ce lieu.',
} as const

export type AjouterStructureEmployeuseEnLieuErrorKey =
  (typeof AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS)[keyof typeof AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS]
