import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'

export type BeneficiairesAnonymises = {
  readonly ids: readonly BeneficiaireId[]
  readonly maintenant: Date
}
