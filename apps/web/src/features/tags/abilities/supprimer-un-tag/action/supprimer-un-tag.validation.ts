import { z } from 'zod'

export const SupprimerUnTagValidation = z.object({
  tagId: z.guid(),
})
