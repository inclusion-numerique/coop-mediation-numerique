import z from 'zod'

export const ValiderInscriptionValidation = z.object({
  userId: z.string().uuid(),
  cguAcceptee: z.literal(true, {
    errorMap: () => ({
      message: 'Vous devez accepter les conditions générales d’utilisation',
    }),
  }),
})

export type ValiderInscriptionData = z.infer<
  typeof ValiderInscriptionValidation
>
