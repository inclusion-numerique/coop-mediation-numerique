import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { MergeableBeneficiaire } from './merge-beneficiaire-fields'

export type FusionDeBeneficiaires = {
  readonly sourceId: BeneficiaireId
  readonly destinationId: BeneficiaireId
  readonly mediateurId: MediateurId
  readonly donneesDeLaDestination: Partial<MergeableBeneficiaire>
  readonly creation: Date
  readonly maintenant: Date
}
