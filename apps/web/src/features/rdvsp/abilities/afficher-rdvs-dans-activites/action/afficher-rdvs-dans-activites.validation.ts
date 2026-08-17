import { z } from 'zod'

export const AfficherRdvsDansActivitesValidation = z.object({
  afficher: z.boolean(),
})

export type AfficherRdvsDansActivitesInput = z.infer<
  typeof AfficherRdvsDansActivitesValidation
>
