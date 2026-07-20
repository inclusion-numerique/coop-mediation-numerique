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
      // S'arrêter après la PHASE 1 (peuplement des SIRET), sans dédupliquer, lier,
      // propager ni créer. À utiliser quand l'objectif est la COUVERTURE et non la
      // cohérence : les phases 2 à 5 fusionnent en dur des lignes coop qui n'ont
      // besoin que de leur propre ligne `main`, et apparient à SIRET strictement
      // égal — moins bien que `refactor/audit-coop-main/plan-complet.sql`, qui
      // élargit au SIREN et passe par une validation humaine.
      peuplementSeul: z.boolean().optional().default(false),
    })
    .optional()
    .default({}),
})

export type CorrigerEmployeusesSansSiretJob = z.infer<
  typeof CorrigerEmployeusesSansSiretJobValidation
>
