import z from 'zod'

export const AnonymiserLesComptesInactifsJobValidation = z.object({
  name: z.literal('anonymiser-les-comptes-inactifs'),
  payload: z
    .object({
      simuler: z.boolean().optional().default(false),
    })
    .optional(),
})
