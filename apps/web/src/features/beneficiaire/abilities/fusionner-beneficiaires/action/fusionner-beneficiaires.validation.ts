import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { z } from 'zod'

export const FusionnerBeneficiairesValidation = z.object({
  fusions: z
    .array(
      z.object({
        sourceId: BeneficiaireId.schema,
        destinationId: BeneficiaireId.schema,
      }),
    )
    .min(1),
})
