import { z } from 'zod'

export const RefuserUneInvitationValidation = z.object({
  email: z.email(),
  coordinateurId: z.guid(),
})
