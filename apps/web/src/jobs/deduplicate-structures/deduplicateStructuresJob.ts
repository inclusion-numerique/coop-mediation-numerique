import z from 'zod'

export const DeduplicateStructuresJobValidation = z.object({
  name: z.literal('deduplicate-structures'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(false),
    })
    .optional(),
})

export type DeduplicateStructuresJob = z.infer<
  typeof DeduplicateStructuresJobValidation
>
