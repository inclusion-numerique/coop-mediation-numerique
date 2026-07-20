import z from 'zod'

export const DeduplicateEmployeusesJobValidation = z.object({
  name: z.literal('deduplicate-employeuses'),
  payload: z
    .object({
      // `dryRun` vaut true par défaut : la fusion SUPPRIME les employeuses absorbées
      // (`mergeStructureAdministrative` fait une suppression dure), l'écriture doit donc
      // être un opt-in explicite.
      dryRun: z.boolean().optional().default(true),
      // SIRET dont le groupe est ignoré en entier, pour mettre de côté un arbitrage
      // manuel sans toucher au reste du lot.
      excludeSirets: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({}),
})

export type DeduplicateEmployeusesJob = z.infer<
  typeof DeduplicateEmployeusesJobValidation
>
