import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { BeneficiairesAnonymises } from './beneficiaires-anonymises'

export type BeneficiairesExistants = (input: {
  readonly ids: readonly BeneficiaireId[]
  readonly mediateurId: MediateurId
}) => Promise<readonly BeneficiaireId[]>

export type AnonymiserLesBeneficiaires = (
  anonymisation: BeneficiairesAnonymises,
) => Promise<void>

export type SupprimerBeneficiairesPorts = {
  readonly beneficiairesExistants: BeneficiairesExistants
  readonly anonymiserLesBeneficiaires: AnonymiserLesBeneficiaires
}
