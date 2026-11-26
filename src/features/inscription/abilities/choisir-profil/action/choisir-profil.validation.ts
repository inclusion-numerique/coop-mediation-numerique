import { z } from 'zod'
import { Role } from '@/features/inscription/domain'

const rolesDisponibles = ['Mediateur', 'Coordinateur'] as const

export const choisirProfilFormShape = z.object({
  role: z.enum(rolesDisponibles, {
    error: 'Veuillez choisir un poste',
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

export const ChoisirProfilValidation = choisirProfilFormShape.transform(
  ({ role }) => ({ role: Role(role) }),
)
