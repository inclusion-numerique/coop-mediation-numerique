export const AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS = {
  EmployeuseIntrouvable:
    'Aucune structure employeuse n’est rattachée à votre compte',
} as const

export type AjouterStructureEmployeuseEnLieuErrorKey =
  (typeof AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS)[keyof typeof AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS]
