import { z } from 'zod'

export const AnnulerUneInvitationValidation = z.object({
  email: z.email(),
  coordinateurId: z.guid(),
})
