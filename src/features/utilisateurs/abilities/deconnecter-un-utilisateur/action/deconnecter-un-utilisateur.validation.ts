import { z } from 'zod'

export const DeconnecterUnUtilisateurValidation = z.object({
  utilisateurId: z.guid(),
})
