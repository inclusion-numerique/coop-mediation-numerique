import { z } from 'zod'

export const UsurperUnUtilisateurValidation = z.object({
  utilisateurId: z.guid(),
})
