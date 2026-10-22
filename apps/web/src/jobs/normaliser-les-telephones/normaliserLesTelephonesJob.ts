import z from 'zod'

export const NormaliserLesTelephonesJobValidation = z.object({
  name: z.literal('normaliser-les-telephones'),
  payload: z
    .object({
      appliquer: z.boolean().optional().default(false),
    })
    .optional()
    .default({ appliquer: false }),
})

export type NormaliserLesTelephonesJob = z.infer<
  typeof NormaliserLesTelephonesJobValidation
>
