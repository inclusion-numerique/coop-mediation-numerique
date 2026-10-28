import { z } from 'zod'

export const SupprimerUneActiviteDeCoordinationValidation = z.object({
  activiteId: z.guid(),
})
