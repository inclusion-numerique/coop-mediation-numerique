import z from 'zod'

export const LinkEmployeusesMainJobValidation = z.object({
  name: z.literal('link-employeuses-main'),
  payload: z
    .object({
      // `dryRun` vaut true par défaut : le job ÉCRIT dans `main`, schéma co-possédé avec
      // l'Entrepôt. L'écriture doit être un opt-in explicite.
      dryRun: z.boolean().optional().default(true),
      // SIRET à ne pas lier, pour mettre de côté un arbitrage sans bloquer le lot.
      excludeSirets: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({}),
})

export type LinkEmployeusesMainJob = z.infer<
  typeof LinkEmployeusesMainJobValidation
>
