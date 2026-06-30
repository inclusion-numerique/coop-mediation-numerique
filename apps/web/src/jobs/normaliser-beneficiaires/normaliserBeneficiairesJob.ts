import z from 'zod'

export const NormaliserBeneficiairesJobValidation = z.object({
  name: z.literal('normaliser-beneficiaires'),
  payload: z.object({}).optional(),
})

export type NormaliserBeneficiairesJob = z.infer<
  typeof NormaliserBeneficiairesJobValidation
>
