import z from 'zod'

export const SynchroniserLesRolesBrevoJobValidation = z.object({
  name: z.literal('synchroniser-les-roles-brevo'),
  payload: z.undefined().optional(),
})

export type SynchroniserLesRolesBrevoJob = z.infer<
  typeof SynchroniserLesRolesBrevoJobValidation
>
