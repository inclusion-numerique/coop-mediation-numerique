import z from 'zod'

export const NormalizeStructuresEmployeusesJobValidation = z.object({
  name: z.literal('normalize-structures-employeuses'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(false),
      minDaysSinceLastSync: z.number().optional().default(7),
    })
    .optional(),
})

export type NormalizeStructuresEmployeusesJob = z.infer<
  typeof NormalizeStructuresEmployeusesJobValidation
>
