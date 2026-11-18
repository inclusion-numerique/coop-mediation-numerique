import { z } from 'zod'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'

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
