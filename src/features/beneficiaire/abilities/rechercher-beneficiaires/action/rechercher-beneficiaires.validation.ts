import { z } from 'zod'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'

export const RechercherBeneficiairesValidation = z.object({
  query: z.string(),
  excludeIds: z.array(BeneficiaireId.schema).default([]),
})
