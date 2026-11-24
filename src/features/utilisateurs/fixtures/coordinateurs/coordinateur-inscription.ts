import { previewBranchAuthFallbacks } from '@/configuration/projet/preview-branch-auth-fallbacks'
import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'
import type { Prisma } from '@/generated/prisma/client'

const coordinateurInscriptionEmail =
  'coordinateur-inscription@coop-numerique.anct.gouv.fr'

export const coordinateurInscription = utilisateur({
  id: '0d4e2e67-ac69-4955-b227-8f4f2ef34673',
  firstName: 'Coordinateur',
  lastName: 'Inscription',
  isFixture: true,
  email: coordinateurInscriptionEmail,
  role: 'User',
  siret: previewBranchAuthFallbacks.anctSiret,
  isConseillerNumerique: true,
  coordinateur: {
    connectOrCreate: {
      where: {
        id: '2e4d546c-9312-4ac1-a771-a6ec48180136',
      },
      create: {
        id: '2e4d546c-9312-4ac1-a771-a6ec48180136',
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
}) satisfies Prisma.UserCreateInput
