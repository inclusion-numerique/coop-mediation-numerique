export const MODIFIER_BENEFICIAIRE_ERRORS = {
  BeneficiaireNotFound: 'Bénéficiaire introuvable',
} as const

export type ModifierBeneficiaireErrorKey =
  (typeof MODIFIER_BENEFICIAIRE_ERRORS)[keyof typeof MODIFIER_BENEFICIAIRE_ERRORS]
