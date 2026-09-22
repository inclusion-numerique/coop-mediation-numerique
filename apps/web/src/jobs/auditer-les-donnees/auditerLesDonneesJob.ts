import z from 'zod'

export const AuditerLesDonneesJobValidation = z.object({
  name: z.literal('auditer-les-donnees'),
  payload: z
    .object({
      /** Écrit le détail ligne à ligne dans un CSV, en plus du relevé. */
      csv: z.boolean().optional().default(true),
      /**
       * Applique les corrections que l'audit sait faire. Sans ce drapeau, le
       * job ne fait que mesurer : on regarde avant de toucher.
       */
      corriger: z.boolean().optional().default(false),
    })
    .optional(),
})

export type AuditerLesDonneesJob = z.infer<
  typeof AuditerLesDonneesJobValidation
>
