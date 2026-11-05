import z from 'zod'

export const AlignerLeRegistreDesPersonnesJobValidation = z.object({
  name: z.literal('aligner-le-registre-des-personnes'),
  payload: z
    .object({
      appliquer: z.boolean().optional().default(false),
      inclureLesComptesSupprimesMultiSources: z
        .boolean()
        .optional()
        .default(false),
    })
    .optional(),
})

export type AlignerLeRegistreDesPersonnesJob = z.infer<
  typeof AlignerLeRegistreDesPersonnesJobValidation
>
