import { z } from 'zod'

export const ExportBeneficiairesFilterValidations = z.object({
  recherche: z.string().optional(),
})

export type ExportBeneficiairesFilterData = z.infer<
  typeof ExportBeneficiairesFilterValidations
>
