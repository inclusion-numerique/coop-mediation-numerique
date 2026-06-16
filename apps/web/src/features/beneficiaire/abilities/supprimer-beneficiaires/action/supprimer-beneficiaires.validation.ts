import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { z } from 'zod'

export const SupprimerBeneficiairesValidation = z.object({
  ids: z.array(BeneficiaireId.schema).min(1),
  mediateurId: MediateurId.schema,
})
