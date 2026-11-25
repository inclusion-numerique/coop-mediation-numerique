import { previewBranchAuthFallbacks } from '@/configuration/projet'
import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'
import type { Prisma } from '@/generated/prisma/client'

export const coordinateurInscriptionAvecToutCoordinateurId =
  'b0ebe56a-b1eb-49c0-9963-26dbbaa1c15e'

export const coordinateurInscriptionAvecToutMediateurId =
  'add33310-e93b-46c1-98ee-aa926bae993d'

const coordinateurInscriptionAvecToutEmail =
  'coordinateur-inscription-avec-tout@coop-numerique.anct.gouv.fr'

export const coordinateurInscriptionAvecTout = utilisateur({
  id: '057c3fce-3c7e-4bc7-9596-8d30ef559c1a',
  firstName: 'Coordinateur',
  lastName: 'Inscription avec tout',
  email: coordinateurInscriptionAvecToutEmail,
  isFixture: true,
  role: 'User',
  siret: previewBranchAuthFallbacks.anctSiret,
  isConseillerNumerique: true,
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscriptionAvecToutCoordinateurId,
      },
      create: {
        id: coordinateurInscriptionAvecToutCoordinateurId,
      },
    },
  },
  mediateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscriptionAvecToutMediateurId,
      },
      create: {
        id: coordinateurInscriptionAvecToutMediateurId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
}) satisfies Prisma.UserCreateInput
