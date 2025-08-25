import z from 'zod'

export const MigrateCrasV1JobValidation = z.object({
  name: z.literal('migrate-cras-v1'),
  payload: z
    .object({
      skip: z.number().default(0),
      take: z.number().nullish(),
      batch: z.number().default(4_000),
    })
    .default({}),
})

export type MigrateCrasV1Job = z.infer<typeof MigrateCrasV1JobValidation>
