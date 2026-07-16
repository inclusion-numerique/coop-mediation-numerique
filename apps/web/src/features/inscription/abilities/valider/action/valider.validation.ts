import { z } from 'zod'

/**
 * Contrat d'input de la server action : l'acceptation des CGU est une garde
 * obligatoire (imposée par le formulaire), pas une donnée transmise en aval.
 * L'utilisateur vient de l'authentification, jamais de l'input.
 */
export const ValiderValidation = z.object({
  cguAcceptee: z.literal(true, {
    errorMap: () => ({
      message: 'Vous devez accepter les conditions générales d’utilisation',
    }),
  }),
})

export type ValiderFormData = z.infer<typeof ValiderValidation>
