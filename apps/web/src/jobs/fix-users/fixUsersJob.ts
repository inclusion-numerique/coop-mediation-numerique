import z from 'zod'

export const FixUsersJobValidation = z.object({
  name: z.literal('fix-users'),
  payload: z.object({}).optional(),
})

export type FixUsersJob = z.infer<typeof FixUsersJobValidation>
