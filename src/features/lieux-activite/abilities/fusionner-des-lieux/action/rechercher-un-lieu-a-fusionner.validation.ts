import { z } from 'zod'

export const RechercherUnLieuAFusionnerValidation = z.object({
  recherche: z.string(),
})
