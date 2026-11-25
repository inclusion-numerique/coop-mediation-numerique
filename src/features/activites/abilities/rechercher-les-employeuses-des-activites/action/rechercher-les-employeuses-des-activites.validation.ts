import { z } from 'zod'

export const RechercherLesEmployeusesDesActivitesValidation = z.object({
  recherche: z.string(),
  exclues: z.array(z.string().regex(/^\d+$/)),
})

export const RechercherLesEmployeusesDuPartageValidation =
  RechercherLesEmployeusesDesActivitesValidation.extend({
    partage: z.string(),
  })

export type RechercheDEmployeusesDesActivites = z.input<
  typeof RechercherLesEmployeusesDesActivitesValidation
>
