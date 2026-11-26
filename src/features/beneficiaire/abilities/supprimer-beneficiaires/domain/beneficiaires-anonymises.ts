import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'

export type BeneficiairesAnonymises = {
  readonly ids: readonly BeneficiaireId[]
  readonly mediateurId: MediateurId
  readonly maintenant: Date
}
