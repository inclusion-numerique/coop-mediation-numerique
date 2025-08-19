import z from 'zod'

export const MigrateUsersV1JobValidation = z.object({
  name: z.literal('migrate-users-v1'),
  payload: z.object({}).default({}),
})

export type MigrateUsersV1Job = z.infer<typeof MigrateUsersV1JobValidation>
