import { z } from 'zod'

export const RechercherDesMediateursAAjouterValidation = z.object({
  coordinateurId: z.guid(),
  recherche: z.string().trim().min(2),
})
