import z from 'zod'

export const CorrigerEmployeusesSansSiretJobValidation = z.object({
  name: z.literal('corriger-employeuses-sans-siret'),
  payload: z
    .object({
      // `dryRun` vaut true par défaut : le job ÉCRIT dans coop (SIRET + fusions) et dans
      // main (liaisons). Le dry-run simule le chaînage complet en mémoire sans rien écrire.
      dryRun: z.boolean().optional().default(true),
      // CSV validé (colonnes coop_id ; … ; siret_valide), relatif à la racine du repo.
      csvPath: z
        .string()
        .optional()
        .default(
          'refactor/audit-coop-main/out/employeuses-sans-siret-a-completer.csv',
        ),
    })
    .optional()
    .default({}),
})

export type CorrigerEmployeusesSansSiretJob = z.infer<
  typeof CorrigerEmployeusesSansSiretJobValidation
>
