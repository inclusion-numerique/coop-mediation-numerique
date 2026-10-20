import z from 'zod'

export const RattraperLesComptesSupprimesJobValidation = z.object({
  name: z.literal('rattraper-les-comptes-supprimes'),
  payload: z.object({
    administrateurId: z.guid(),
    appliquer: z.boolean().optional().default(false),
  }),
})

export type RattraperLesComptesSupprimesJob = z.infer<
  typeof RattraperLesComptesSupprimesJobValidation
>
