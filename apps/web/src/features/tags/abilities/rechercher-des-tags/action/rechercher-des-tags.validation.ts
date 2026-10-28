import { z } from 'zod'

export const RechercherDesTagsValidation = z.object({
  recherche: z.string(),
  exclus: z.array(z.guid()).default([]),
})
