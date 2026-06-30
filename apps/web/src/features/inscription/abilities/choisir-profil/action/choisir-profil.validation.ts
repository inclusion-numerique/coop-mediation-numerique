import { ProfilInscription } from '@app/web/features/inscription/domain/profil-inscription'
import { z } from 'zod'
import { profilsDisponibles } from '../domain/choisir-profil'

/**
 * Forme du formulaire : le profil choisi + l'acceptation obligatoire des CGU.
 * Sert de validateur du côté client (`useAppForm`).
 */
export const choisirProfilFormShape = z.object({
  profil: z.enum(profilsDisponibles, {
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
 * comprises) puis projette vers l'input domaine (profil brandé). L'acceptation
 * des CGU est une garde, pas une donnée transmise en aval.
 */
export const ChoisirProfilValidation = choisirProfilFormShape.transform(
  ({ profil }) => ({ profil: ProfilInscription(profil) }),
)
