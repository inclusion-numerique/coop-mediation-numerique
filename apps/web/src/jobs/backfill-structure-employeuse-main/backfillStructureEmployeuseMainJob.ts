import z from 'zod'

export const BackfillStructureEmployeuseMainJobValidation = z.object({
  name: z.literal('backfill-structure-employeuse-main'),
  payload: z
    .object({
      // Écrit dans coop (base partagée) : dry-run par défaut (compte seulement ce qui reste à faire).
      dryRun: z.boolean().optional().default(true),
      // Taille des lots pour le remplissage de coop.activites (~4 M lignes).
      batchSize: z.number().int().positive().optional().default(50_000),
    })
    .optional(),
})

export type BackfillStructureEmployeuseMainJob = z.infer<
  typeof BackfillStructureEmployeuseMainJobValidation
>
