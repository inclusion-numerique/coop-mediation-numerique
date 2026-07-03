import z from 'zod'

export const ApplySupprimerLieuxJobValidation = z.object({
  name: z.literal('apply-supprimer-lieux'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type ApplySupprimerLieuxJob = z.infer<
  typeof ApplySupprimerLieuxJobValidation
>
