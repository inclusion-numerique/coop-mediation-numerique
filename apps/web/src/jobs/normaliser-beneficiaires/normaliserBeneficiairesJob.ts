import z from 'zod'

export const NormaliserBeneficiairesJobValidation = z.object({
  name: z.literal('normaliser-beneficiaires'),
  // dryRun par défaut : une exécution sans payload ne peut PAS écrire.
  payload: z
    .object({
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type NormaliserBeneficiairesJob = z.infer<
  typeof NormaliserBeneficiairesJobValidation
>
