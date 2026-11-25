import { z } from 'zod'

export const RechercherDesLieuxAAjouterValidation = z.object({
  recherche: z.string(),
})
