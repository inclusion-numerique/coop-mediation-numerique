import { z } from 'zod'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'

export const SupprimerBeneficiairesValidation = z.object({
  ids: z.array(BeneficiaireId.schema).min(1),
})
