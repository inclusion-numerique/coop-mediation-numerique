import z from 'zod'

export const ApplyCorrigerAdresseJobValidation = z.object({
  name: z.literal('apply-corriger-adresse'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type ApplyCorrigerAdresseJob = z.infer<
  typeof ApplyCorrigerAdresseJobValidation
>
