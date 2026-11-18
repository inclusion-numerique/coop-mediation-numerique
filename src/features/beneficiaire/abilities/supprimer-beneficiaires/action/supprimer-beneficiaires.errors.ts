export const SUPPRIMER_BENEFICIAIRES_ERRORS = {
  AucunBeneficiaireValide: 'Aucun bénéficiaire valide',
} as const

export type SupprimerBeneficiairesErrorKey =
  (typeof SUPPRIMER_BENEFICIAIRES_ERRORS)[keyof typeof SUPPRIMER_BENEFICIAIRES_ERRORS]
