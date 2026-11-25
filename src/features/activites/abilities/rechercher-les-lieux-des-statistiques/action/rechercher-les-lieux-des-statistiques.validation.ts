import { z } from 'zod'
import { GENRES_DE_LIEU } from '../domain'

export const RechercherLesLieuxDesStatistiquesValidation = z.object({
  genre: z.enum(GENRES_DE_LIEU),
  recherche: z.string().max(100),
})

export const RechercherLesLieuxDuPartageValidation =
  RechercherLesLieuxDesStatistiquesValidation.extend({
    partage: z.string(),
  })

export type RechercheDeLieuxDesStatistiques = z.input<
  typeof RechercherLesLieuxDesStatistiquesValidation
>
