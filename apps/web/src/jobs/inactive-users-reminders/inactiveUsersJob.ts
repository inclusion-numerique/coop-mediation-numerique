import z from 'zod'

export const InactiveUsersRemindersJobValidation = z.object({
  name: z.literal('inactive-users-reminders'),
  payload: z.object({}).optional(),
})

export type InactiveUsersRemindersJob = z.infer<
  typeof InactiveUsersRemindersJobValidation
>
