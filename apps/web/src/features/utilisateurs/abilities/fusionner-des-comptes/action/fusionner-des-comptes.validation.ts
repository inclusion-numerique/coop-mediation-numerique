import { z } from 'zod'

export const FusionnerDesComptesValidation = z.object({
  sourceId: z.guid(),
  cibleId: z.guid(),
})

export const RechercherDesComptesAFusionnerValidation = z.object({
  recherche: z.string().trim().min(2),
  cibleId: z.guid(),
})
