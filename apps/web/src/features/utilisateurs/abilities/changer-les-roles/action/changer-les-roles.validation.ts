import { z } from 'zod'

export const ChangerLesRolesValidation = z.object({
  utilisateurId: z.guid(),
  mediateur: z.boolean(),
  coordinateur: z.boolean(),
})
