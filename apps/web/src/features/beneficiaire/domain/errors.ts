import type { BeneficiaireId } from './beneficiaire'

export type BeneficiaireNotFound = {
  readonly _tag: 'BeneficiaireNotFound'
  readonly id: BeneficiaireId
}

export type BeneficiaireAlreadyExists = {
  readonly _tag: 'BeneficiaireAlreadyExists'
  readonly id: BeneficiaireId
}
