import z from 'zod'

export const AuditerLesDonneesJobValidation = z.object({
  name: z.literal('auditer-les-donnees'),
  payload: z
    .object({
      /** Écrit le détail ligne à ligne dans un CSV, en plus du relevé. */
      csv: z.boolean().optional().default(true),
    })
    .optional(),
})

export type AuditerLesDonneesJob = z.infer<
  typeof AuditerLesDonneesJobValidation
>
