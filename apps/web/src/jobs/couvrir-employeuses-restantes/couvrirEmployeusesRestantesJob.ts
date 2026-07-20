import z from 'zod'

export const CouvrirEmployeusesRestantesJobValidation = z.object({
  name: z.literal('couvrir-employeuses-restantes'),
  payload: z
    .object({
      // `dryRun` vaut true par défaut : le job ÉCRIT dans `main`, schéma co-possédé avec
      // l'Entrepôt, et SUPPRIME une ligne coop (fusion). L'écriture est un opt-in explicite.
      dryRun: z.boolean().optional().default(true),
    })
    .optional()
    .default({}),
})

export type CouvrirEmployeusesRestantesJob = z.infer<
  typeof CouvrirEmployeusesRestantesJobValidation
>
