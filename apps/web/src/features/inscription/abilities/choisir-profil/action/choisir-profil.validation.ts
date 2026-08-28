import { Role } from '@app/web/features/inscription/domain'
import { z } from 'zod'
import { rolesDisponibles } from '../domain/choisir-profil'

/**
 * Forme du formulaire : le rôle choisi + l'acceptation obligatoire des CGU.
 * Sert de validateur du côté client (`useAppForm`).
 */
export const choisirProfilFormShape = z.object({
  role: z.enum(rolesDisponibles, {
    required_error: 'Veuillez choisir un poste',
  }),
  cguAcceptee: z
    .boolean()
    .default(false)
    .refine((accepte) => accepte, {
      message:
        'Pour continuer, vous devez accepter les conditions générales d’utilisation',
    }),
})

export type ChoisirProfilFormData = z.infer<typeof choisirProfilFormShape>

/**
 * Contrat d'input de la server action : valide la forme du formulaire (CGU
 * comprises) puis projette vers l'input domaine (rôle brandé). L'acceptation
 * des CGU est une garde, pas une donnée transmise en aval.
 */
export const ChoisirProfilValidation = choisirProfilFormShape.transform(
  ({ role }) => ({ role: Role(role) }),
)
