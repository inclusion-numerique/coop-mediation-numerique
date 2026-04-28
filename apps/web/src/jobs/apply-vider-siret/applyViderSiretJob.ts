import z from 'zod'

export const ApplyViderSiretJobValidation = z.object({
  name: z.literal('apply-vider-siret'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type ApplyViderSiretJob = z.infer<typeof ApplyViderSiretJobValidation>
