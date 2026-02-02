import z from 'zod'

export const RemoveOrphanBrevoContactsJobValidation = z.object({
  name: z.literal('remove-orphan-brevo-contacts'),
  payload: z.undefined(),
})

export type RemoveOrphanBrevoContactsJob = z.infer<
  typeof RemoveOrphanBrevoContactsJobValidation
>
