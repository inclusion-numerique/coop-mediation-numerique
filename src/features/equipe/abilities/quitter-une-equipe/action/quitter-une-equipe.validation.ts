import { z } from 'zod'

export const QuitterUneEquipeValidation = z.object({
  coordinateurId: z.guid(),
})
