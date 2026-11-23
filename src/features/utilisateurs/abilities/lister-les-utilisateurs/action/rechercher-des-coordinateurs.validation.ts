import { z } from 'zod'

export const RechercherDesCoordinateursValidation = z.object({
  recherche: z.string().trim().min(3),
})
