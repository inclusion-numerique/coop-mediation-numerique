import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Result } from '@app/web/libraries/result'
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
