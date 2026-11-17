import { z } from 'zod'

export const RechercherLesEmployeusesDesActivitesValidation = z.object({
  recherche: z.string(),
  exclues: z.array(z.string().regex(/^\d+$/)),
})
