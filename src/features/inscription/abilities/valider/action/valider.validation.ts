import { z } from 'zod'

export const ValiderValidation = z.object({
  cguAcceptee: z
    .boolean()
    .default(false)
    .refine((accepte) => accepte, {
      message:
        'Pour continuer, vous devez accepter les conditions générales d’utilisation',
    }),
})

export type ValiderFormData = z.infer<typeof ValiderValidation>
