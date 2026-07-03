import z from 'zod'

export const DeduplicateLieuxJobValidation = z.object({
  name: z.literal('deduplicate-lieux'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(false),
    })
    .optional(),
})

export type DeduplicateLieuxJob = z.infer<typeof DeduplicateLieuxJobValidation>
