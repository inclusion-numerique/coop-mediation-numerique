import type { BeneficiaireId } from './beneficiaire-id'

export type BeneficiaireNotFound = {
  readonly _tag: 'BeneficiaireNotFound'
  readonly id: BeneficiaireId
}

export const BeneficiaireNotFound = (
  id: BeneficiaireId,
): BeneficiaireNotFound => ({ _tag: 'BeneficiaireNotFound', id })

export type BeneficiaireAlreadyExists = {
  readonly _tag: 'BeneficiaireAlreadyExists'
  readonly id: BeneficiaireId
}

export const BeneficiaireAlreadyExists = (
  id: BeneficiaireId,
): BeneficiaireAlreadyExists => ({ _tag: 'BeneficiaireAlreadyExists', id })

export type AucunBeneficiaireValide = {
  readonly _tag: 'AucunBeneficiaireValide'
}

export const AucunBeneficiaireValide: AucunBeneficiaireValide = {
  _tag: 'AucunBeneficiaireValide',
}
