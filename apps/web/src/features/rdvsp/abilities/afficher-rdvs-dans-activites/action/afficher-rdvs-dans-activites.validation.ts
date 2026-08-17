import { z } from 'zod'

export const AfficherRdvsDansActivitesValidation = z.object({
  afficher: z.boolean(),
})
