import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { BeneficiaireInformations } from './beneficiaire-informations'

export type ConsulterBeneficiaire = (input: {
  readonly beneficiaireId: BeneficiaireId
  readonly mediateurId: MediateurId
}) => Promise<BeneficiaireInformations | null>
