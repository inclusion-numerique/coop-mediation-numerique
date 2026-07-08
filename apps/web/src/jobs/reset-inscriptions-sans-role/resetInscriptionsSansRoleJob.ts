import z from 'zod'

export const ResetInscriptionsSansRoleJobValidation = z.object({
  name: z.literal('reset-inscriptions-sans-role'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type ResetInscriptionsSansRoleJob = z.infer<
  typeof ResetInscriptionsSansRoleJobValidation
>
