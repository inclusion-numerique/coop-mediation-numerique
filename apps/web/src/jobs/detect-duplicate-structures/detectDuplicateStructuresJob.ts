import z from 'zod'

export const DetectDuplicateStructuresJobValidation = z.object({
  name: z.literal('detect-duplicate-structures'),
  payload: z
    .object({
      seuilScore: z.number().optional().default(0.6),
      limit: z.number().optional(),
    })
    .optional(),
})

export type DetectDuplicateStructuresJob = z.infer<
  typeof DetectDuplicateStructuresJobValidation
>
