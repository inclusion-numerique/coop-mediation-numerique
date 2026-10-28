import { z } from 'zod'

export const FusionnerUnTagValidation = z.object({
  sourceId: z.guid(),
  destinationId: z.guid(),
})
