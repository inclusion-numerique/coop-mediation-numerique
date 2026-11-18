import { z } from 'zod'

export const SupprimerUnAncienMembreValidation = z.object({
  mediateurId: z.guid(),
  coordinateurId: z.guid(),
})
