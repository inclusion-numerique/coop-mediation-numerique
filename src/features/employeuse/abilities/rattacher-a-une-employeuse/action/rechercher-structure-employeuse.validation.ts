import { z } from 'zod'

export const RechercherStructureEmployeuseValidation = z.object({
  query: z.string(),
})
