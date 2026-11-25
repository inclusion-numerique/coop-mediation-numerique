import { z } from 'zod'

export const RechercherUnLieuActiviteValidation = z.object({
  recherche: z.string(),
})
