import { z } from 'zod'
import { BeneficiaireId } from '../../domain/beneficiaire-id'
import { MediateurId } from '../../domain/mediateur-id'

export const SupprimerBeneficiairesValidation = z.object({
  ids: z.array(BeneficiaireId.schema).min(1),
  mediateurId: MediateurId.schema,
})
