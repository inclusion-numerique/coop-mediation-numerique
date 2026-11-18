import { z } from 'zod'

export const RechercherDesDestinationsValidation = z.object({
  sourceId: z.guid(),
  recherche: z.string(),
})
