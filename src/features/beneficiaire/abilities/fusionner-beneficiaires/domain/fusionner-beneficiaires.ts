import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Result } from '@/libraries/result'
import type {
  BeneficiaireDestinationIntrouvable,
  BeneficiaireSourceIntrouvable,
} from './errors'

export type FusionnerBeneficiaires = (input: {
  sourceId: BeneficiaireId
  destinationId: BeneficiaireId
  mediateurId: MediateurId
}) => Promise<
  Result<
    { beneficiaireFusionneId: BeneficiaireId },
    BeneficiaireSourceIntrouvable | BeneficiaireDestinationIntrouvable
  >
>
