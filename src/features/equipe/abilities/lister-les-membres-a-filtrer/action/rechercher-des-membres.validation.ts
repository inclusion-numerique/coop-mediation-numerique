import { z } from 'zod'

export const RechercherDesMembresValidation = z.object({
  recherche: z.string().max(100),
})
