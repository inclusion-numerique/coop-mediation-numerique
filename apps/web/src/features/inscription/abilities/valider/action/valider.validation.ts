import { z } from 'zod'

/**
 * Forme du formulaire (client) : l'acceptation des CGU. Booléen — et non
 * `literal(true)` — pour autoriser une valeur par défaut décochée quand
 * l'utilisateur doit accepter au récapitulatif (flow Dataspace) ; le `refine`
 * rend l'acceptation obligatoire à la soumission.
 */
export const validerFormShape = z.object({
  cguAcceptee: z
    .boolean()
    .default(false)
    .refine((accepte) => accepte, {
      message:
        'Pour continuer, vous devez accepter les conditions générales d’utilisation',
    }),
})

export type ValiderFormData = z.infer<typeof validerFormShape>

/**
 * Contrat d'input de la server action : même garde d'acceptation des CGU. Elle
 * ne transporte aucune donnée en aval — l'utilisateur vient de l'authentification.
 */
export const ValiderValidation = validerFormShape
