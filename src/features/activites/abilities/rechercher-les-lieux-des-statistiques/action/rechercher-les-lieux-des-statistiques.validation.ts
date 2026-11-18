import { z } from 'zod'
import { GENRES_DE_LIEU } from '../domain'

export const RechercherLesLieuxDesStatistiquesValidation = z.object({
  genre: z.enum(GENRES_DE_LIEU),
  recherche: z.string().max(100),
})
