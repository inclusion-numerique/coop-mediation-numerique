import { z } from 'zod'

export const RechercherDesEmployeusesValidation = z.object({
  recherche: z.string().trim().min(3),
})
