import { z } from 'zod'

export const RechercherDesMediateursAInviterValidation = z.object({
  recherche: z.string(),
})
