import z from 'zod'

export const MigrateCrasV1JobValidation = z.object({
  name: z.literal('migrate-cras-v1'),
  payload: z.object({}).default({}),
})

export type MigrateCrasV1Job = z.infer<typeof MigrateCrasV1JobValidation>
