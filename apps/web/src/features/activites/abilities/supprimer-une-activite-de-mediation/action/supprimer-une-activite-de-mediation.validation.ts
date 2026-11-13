import { z } from 'zod'

export const SupprimerUneActiviteDeMediationValidation = z.object({
  activiteId: z.guid(),
})
