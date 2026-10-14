import { z } from 'zod'

export const RelancerUneInvitationValidation = z.object({
  email: z.email(),
  coordinateurId: z.guid(),
})
