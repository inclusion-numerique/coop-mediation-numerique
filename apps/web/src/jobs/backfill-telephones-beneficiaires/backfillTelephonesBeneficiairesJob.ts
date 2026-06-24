import z from 'zod'

export const BackfillTelephonesBeneficiairesJobValidation = z.object({
  name: z.literal('backfill-telephones-beneficiaires'),
  payload: z.object({}).optional(),
})

export type BackfillTelephonesBeneficiairesJob = z.infer<
  typeof BackfillTelephonesBeneficiairesJobValidation
>
