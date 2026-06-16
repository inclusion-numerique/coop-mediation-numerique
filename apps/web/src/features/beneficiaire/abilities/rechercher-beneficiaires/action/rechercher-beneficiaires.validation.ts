import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { z } from 'zod'

export const RechercherBeneficiairesValidation = z.object({
  query: z.string(),
  excludeIds: z.array(BeneficiaireId.schema).default([]),
  mediateurId: MediateurId.schema,
})
