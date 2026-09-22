import z from 'zod'

export const ReprendreLesDonneesDesLieuxJobValidation = z.object({
  name: z.literal('reprendre-les-donnees-des-lieux'),
  payload: z
    .object({
      reprendre: z.boolean().optional().default(false),
      csv: z.boolean().optional().default(true),
    })
    .optional(),
})

export type ReprendreLesDonneesDesLieuxJob = z.infer<
  typeof ReprendreLesDonneesDesLieuxJobValidation
>
