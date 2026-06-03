import z from 'zod'

export const BackfillTrancheAgeJobValidation = z.object({
  name: z.literal('backfill-tranche-age'),
  payload: z.object({}).optional(),
})

export type BackfillTrancheAgeJob = z.infer<
  typeof BackfillTrancheAgeJobValidation
>
