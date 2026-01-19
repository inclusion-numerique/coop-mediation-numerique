import { givenUser } from '../givenUser'
import { centreSocial, mediateque, structureEmployeuse } from '../structures'

export const coordinateurInscritAvecToutCoordinateurId =
  '02f9e2f6-61ba-4179-b96d-934b58d6b15e'

export const coordinateurInscritAvecToutMediateurId =
  '379a0d7e-54ac-4db6-95c4-3752cdd05d32'

export const coordinateurInscritAvecTout = givenUser({
  id: '8c8824f0-a10d-4e30-baf0-8d4fab5c7a74',
  firstName: 'Coordinateur',
  lastName: 'Inscrit avec tout',
  lastLogin: new Date(),
  isFixture: true,
  role: 'User',
  isConseillerNumerique: true,
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritAvecToutCoordinateurId,
      },
      create: {
        id: coordinateurInscritAvecToutCoordinateurId,
      },
    },
  },
  mediateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritAvecToutMediateurId,
      },
      create: {
        id: coordinateurInscritAvecToutMediateurId,
        conseillerNumerique: {
          connectOrCreate: {
            where: {
              id: '657070ed7a10c4da5bdd1d57',
            },
            create: {
              id: '657070ed7a10c4da5bdd1d57',
            },
          },
        },
        enActivite: {
          connectOrCreate: [
            {
              where: {
                id: '205a4bcb-d5e8-48e2-ba18-9601cd057ba9',
              },
              create: {
                id: '205a4bcb-d5e8-48e2-ba18-9601cd057ba9',
                structureId: mediateque.id,
                debut: new Date(),
              },
            },
            {
              where: {
                id: 'b8e84702-10c3-4497-8960-8079aed42b23',
              },
              create: {
                id: 'b8e84702-10c3-4497-8960-8079aed42b23',
                structureId: centreSocial.id,
                debut: new Date(),
              },
            },
          ],
        },
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '2511530d-a8f1-49e2-b62e-cca5f3b3d9e4',
      },
      create: {
        id: '2511530d-a8f1-49e2-b62e-cca5f3b3d9e4',
        structureId: structureEmployeuse.id,
        debut: new Date(),
      },
    },
  },
  profilInscription: 'Coordinateur',
  acceptationCgu: new Date(),
  inscriptionValidee: new Date(),
  structureEmployeuseRenseignee: new Date(),
})
