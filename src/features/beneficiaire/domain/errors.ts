import type { BeneficiaireId } from './beneficiaire-id'

export type BeneficiaireNotFound = {
  readonly _tag: 'BeneficiaireNotFound'
  readonly id: BeneficiaireId
}

export const BeneficiaireNotFound = (
  id: BeneficiaireId,
): BeneficiaireNotFound => ({ _tag: 'BeneficiaireNotFound', id })
