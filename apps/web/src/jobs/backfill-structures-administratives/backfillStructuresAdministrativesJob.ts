import z from 'zod'

export const BackfillStructuresAdministrativesJobValidation = z.object({
  name: z.literal('backfill-structures-administratives'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(false),
    })
    .optional(),
})

export type BackfillStructuresAdministrativesJob = z.infer<
  typeof BackfillStructuresAdministrativesJobValidation
>
