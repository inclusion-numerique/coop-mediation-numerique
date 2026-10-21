import { z } from 'zod'

export const ReglerLePartageStatistiquesValidation = z.object({
  actif: z.boolean(),
})
