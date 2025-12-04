import z from 'zod'

export const FixUsersRolesJobValidation = z.object({
  name: z.literal('fix-users-roles'),
  payload: z.object({}).optional(),
})

export type FixUsersRolesJob = z.infer<typeof FixUsersRolesJobValidation>
