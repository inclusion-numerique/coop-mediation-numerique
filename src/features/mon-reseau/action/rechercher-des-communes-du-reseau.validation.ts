import { z } from 'zod'

export const RechercherDesCommunesDuReseauValidation = z.object({
  departement: z.string().max(3),
  recherche: z.string().max(100),
})
