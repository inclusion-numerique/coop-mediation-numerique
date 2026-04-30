import { z } from 'zod'
import { BeneficiaireId } from '../../domain/beneficiaire-id'
import { MediateurId } from '../../domain/mediateur-id'

export const FusionnerBeneficiairesValidation = z.object({
  fusions: z
    .array(
      z.object({
        sourceId: BeneficiaireId.schema,
        destinationId: BeneficiaireId.schema,
      }),
    )
    .min(1),
  mediateurId: MediateurId.schema,
})
