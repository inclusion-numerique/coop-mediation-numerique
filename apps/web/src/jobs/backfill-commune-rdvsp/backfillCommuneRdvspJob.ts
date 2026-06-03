import z from 'zod'

export const BackfillCommuneRdvspJobValidation = z.object({
  name: z.literal('backfill-commune-rdvsp'),
  payload: z
    .object({ limit: z.number().int().positive().optional() })
    .optional(),
})

export type BackfillCommuneRdvspJob = z.infer<
  typeof BackfillCommuneRdvspJobValidation
>
