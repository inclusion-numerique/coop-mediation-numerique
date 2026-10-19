import { z } from 'zod'

export const AccepterUneInvitationValidation = z.object({
  email: z.email(),
  coordinateurId: z.guid(),
})
