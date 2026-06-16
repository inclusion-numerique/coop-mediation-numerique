import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { z } from 'zod'

export const SupprimerBeneficiairesValidation = z.object({
  ids: z.array(BeneficiaireId.schema).min(1),
})
