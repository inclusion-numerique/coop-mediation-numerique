import { z } from 'zod'

export const RechercherUneStructureEmployeuseValidation = z.object({
  query: z.string(),
})
