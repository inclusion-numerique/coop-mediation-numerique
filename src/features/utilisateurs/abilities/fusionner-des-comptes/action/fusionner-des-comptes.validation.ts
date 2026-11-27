import { z } from 'zod'

export const FusionnerDesComptesValidation = z.object({
  sourceId: z.guid(),
  cibleId: z.guid(),
})
