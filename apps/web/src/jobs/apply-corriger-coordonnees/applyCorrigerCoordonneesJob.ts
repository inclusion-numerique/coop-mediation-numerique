import z from 'zod'

export const ApplyCorrigerCoordonneesJobValidation = z.object({
  name: z.literal('apply-corriger-coordonnees'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type ApplyCorrigerCoordonneesJob = z.infer<
  typeof ApplyCorrigerCoordonneesJobValidation
>
