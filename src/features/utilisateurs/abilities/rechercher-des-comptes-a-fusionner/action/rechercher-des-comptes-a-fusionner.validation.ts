import { z } from 'zod'

export const RechercherDesComptesAFusionnerValidation = z.object({
  recherche: z.string().trim().min(2),
  cibleId: z.guid(),
})
