import { z } from 'zod'

export const ExportBeneficiairesFilterValidations = z.object({
  recherche: z.string().optional(),
})
