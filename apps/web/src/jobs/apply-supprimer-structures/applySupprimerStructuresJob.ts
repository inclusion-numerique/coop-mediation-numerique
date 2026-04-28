import z from 'zod'

export const ApplySupprimerStructuresJobValidation = z.object({
  name: z.literal('apply-supprimer-structures'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type ApplySupprimerStructuresJob = z.infer<
  typeof ApplySupprimerStructuresJobValidation
>
