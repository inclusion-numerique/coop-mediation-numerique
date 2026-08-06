import z from 'zod'

export const RelierPersonnesCoopMainJobValidation = z.object({
  name: z.literal('relier-personnes-coop-main'),
  payload: z
    .object({
      // Écrit dans `main` (Entrepôt partagé) : dry-run par défaut, à désactiver explicitement
      // (payload { dryRun: false }) pour appliquer les liens `coop_id`.
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type RelierPersonnesCoopMainJob = z.infer<
  typeof RelierPersonnesCoopMainJobValidation
>
