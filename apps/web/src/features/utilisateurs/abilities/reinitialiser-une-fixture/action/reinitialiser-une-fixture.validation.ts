import { z } from 'zod'

export const ReinitialiserUneFixtureValidation = z.object({
  utilisateurId: z.guid(),
})
