import { z } from 'zod'

export const AjouterUnMembreValidation = z.object({
  utilisateurId: z.guid(),
  coordinateurId: z.guid(),
})
