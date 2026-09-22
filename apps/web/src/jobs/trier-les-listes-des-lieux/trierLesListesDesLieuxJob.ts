import z from 'zod'

export const TrierLesListesDesLieuxJobValidation = z.object({
  name: z.literal('trier-les-listes-des-lieux'),
  payload: z
    .object({
      trier: z.boolean().optional().default(false),
      csv: z.boolean().optional().default(true),
    })
    .optional(),
})

export type TrierLesListesDesLieuxJob = z.infer<
  typeof TrierLesListesDesLieuxJobValidation
>
