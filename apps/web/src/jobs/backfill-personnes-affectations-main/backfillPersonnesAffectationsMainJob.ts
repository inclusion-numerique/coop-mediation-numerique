import z from 'zod'

export const BackfillPersonnesAffectationsMainJobValidation = z.object({
  name: z.literal('backfill-personnes-affectations-main'),
  payload: z
    .object({
      // Écrit dans `main` (Entrepôt partagé) : dry-run par défaut, { dryRun: false } pour appliquer.
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type BackfillPersonnesAffectationsMainJob = z.infer<
  typeof BackfillPersonnesAffectationsMainJobValidation
>
