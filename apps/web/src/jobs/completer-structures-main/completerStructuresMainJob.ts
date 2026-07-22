import z from 'zod'

export const CompleterStructuresMainJobValidation = z.object({
  name: z.literal('completer-structures-main'),
  payload: z
    .object({
      // Ce job écrit dans main (Entrepôt partagé) : dry-run par défaut, à désactiver
      // explicitement (payload { dryRun: false }) pour appliquer.
      dryRun: z.boolean().optional().default(true),
    })
    .optional(),
})

export type CompleterStructuresMainJob = z.infer<
  typeof CompleterStructuresMainJobValidation
>
