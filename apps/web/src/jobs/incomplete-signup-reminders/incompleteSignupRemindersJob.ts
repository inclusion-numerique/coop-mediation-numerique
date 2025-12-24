import z from 'zod'

export const IncompleteSignupRemindersJobValidation = z.object({
  name: z.literal('incomplete-signup-reminders'),
  payload: z.object({}).optional(),
})

export type IncompleteSignupRemindersJob = z.infer<
  typeof IncompleteSignupRemindersJobValidation
>
