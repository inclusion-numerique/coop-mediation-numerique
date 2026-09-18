import z from 'zod'

export const RemoveOrphanBrevoContactsJobValidation = z.object({
  name: z.literal('remove-orphan-brevo-contacts'),
  payload: z.undefined().optional(),
})

export type RemoveOrphanBrevoContactsJob = z.infer<
  typeof RemoveOrphanBrevoContactsJobValidation
>
