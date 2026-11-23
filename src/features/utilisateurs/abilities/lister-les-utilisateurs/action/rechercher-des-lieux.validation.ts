import { z } from 'zod'

export const RechercherDesLieuxValidation = z.object({
  recherche: z.string().trim().min(3),
})
