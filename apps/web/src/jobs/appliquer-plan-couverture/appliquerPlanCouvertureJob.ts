import z from 'zod'

export const AppliquerPlanCouvertureJobValidation = z.object({
  name: z.literal('appliquer-plan-couverture'),
  payload: z.object({
    // `dryRun` vaut true par défaut : le job ÉCRIT dans `main`, schéma co-possédé avec
    // l'Entrepôt, et SUPPRIME des lignes coop (fusions). L'écriture est un opt-in explicite.
    dryRun: z.boolean().optional().default(true),
    // CSV de plan annoté à la main (colonne `Apply` = OK / NOK), produit par
    // `refactor/audit-coop-main/export-plan.sh`. Chemin relatif à la racine du repo.
    csvPath: z.string(),
  }),
})

export type AppliquerPlanCouvertureJob = z.infer<
  typeof AppliquerPlanCouvertureJobValidation
>
