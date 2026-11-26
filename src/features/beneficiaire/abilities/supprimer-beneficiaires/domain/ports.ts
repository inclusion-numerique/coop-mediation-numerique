import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'

export type BeneficiairesExistants = (input: {
  readonly ids: readonly BeneficiaireId[]
  readonly mediateurId: MediateurId
}) => Promise<readonly BeneficiaireId[]>

export type AnonymiserLesBeneficiaires = (input: {
  readonly ids: readonly BeneficiaireId[]
  readonly maintenant: Date
}) => Promise<void>

export type SupprimerBeneficiairesPorts = {
  readonly beneficiairesExistants: BeneficiairesExistants
  readonly anonymiserLesBeneficiaires: AnonymiserLesBeneficiaires
}
