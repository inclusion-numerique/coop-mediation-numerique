import type { MergeableBeneficiaire } from './merge-beneficiaire-fields'

export type BeneficiaireAFusionner = MergeableBeneficiaire & {
  readonly creation: Date
}
