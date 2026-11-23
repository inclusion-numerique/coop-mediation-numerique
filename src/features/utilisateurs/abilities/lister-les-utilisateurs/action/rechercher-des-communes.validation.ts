import { z } from 'zod'

export const RechercherDesCommunesValidation = z.object({
  recherche: z.string().trim().min(2),
})
