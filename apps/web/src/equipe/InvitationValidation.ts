import z from 'zod'

export const InvitationValidation = z.object({
  email: z.email(),
  coordinateurId: z.string(),
})

export type Invitation = z.infer<typeof InvitationValidation>
