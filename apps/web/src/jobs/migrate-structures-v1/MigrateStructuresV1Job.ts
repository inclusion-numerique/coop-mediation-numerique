import z from 'zod'

export const MigrateStructuresV1JobValidation = z.object({
  name: z.literal('migrate-structures-v1'),
  payload: z.object({}).default({}),
})

export type MigrateStructuresV1Job = z.infer<
  typeof MigrateStructuresV1JobValidation
>
