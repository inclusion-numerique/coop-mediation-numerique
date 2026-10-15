import { z } from 'zod'

export const RetirerUnMembreValidation = z.object({
  mediateurId: z.guid(),
  coordinateurId: z.guid(),
})
