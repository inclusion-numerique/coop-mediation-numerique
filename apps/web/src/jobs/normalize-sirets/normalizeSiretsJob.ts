import z from 'zod'

export const NormalizeSiretsJobValidation = z.object({
  name: z.literal('normalize-sirets'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(false),
      minDaysSinceLastSync: z.number().optional().default(7),
    })
    .optional(),
})

export type NormalizeStructuresEmployeusesJob = z.infer<
  typeof NormalizeSiretsJobValidation
>
