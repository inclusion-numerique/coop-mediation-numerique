import z from 'zod'

export const InviterMembreValidation = z.object({
  members: z
    .array(
      z.object({
        email: z.email(),
        nom: z.string().optional(),
        mediateurId: z.string().optional(),
      }),
    )
    .default([]),
})

export type InviterMembreInput = z.input<typeof InviterMembreValidation>
export type InviterMembreData = z.infer<typeof InviterMembreValidation>
