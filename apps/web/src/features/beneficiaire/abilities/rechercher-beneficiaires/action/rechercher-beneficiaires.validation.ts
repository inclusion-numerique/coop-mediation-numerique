import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { z } from 'zod'

export const RechercherBeneficiairesValidation = z.object({
  query: z.string(),
  excludeIds: z.array(BeneficiaireId.schema).default([]),
})
