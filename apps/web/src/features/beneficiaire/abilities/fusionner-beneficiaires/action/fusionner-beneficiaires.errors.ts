export const FUSIONNER_BENEFICIAIRES_ERRORS = {
  BeneficiaireSourceIntrouvable: 'Bénéficiaire source introuvable',
  BeneficiaireDestinationIntrouvable: 'Bénéficiaire de destination introuvable',
} as const

export type FusionnerBeneficiairesErrorKey =
  (typeof FUSIONNER_BENEFICIAIRES_ERRORS)[keyof typeof FUSIONNER_BENEFICIAIRES_ERRORS]
