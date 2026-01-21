import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 110 * day)

export const mediateurCoordinateurJ110MediateurId =
  '1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f'

export const mediateurCoordinateurJ110CoordinateurId =
  '2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a'

export const mediateurCoordinateurJ110 = givenUser({
  id: '3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b',
  firstName: 'Médiateur-Coordinateur',
  lastName: 'J+110',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  onboardingStatus: 'warning_j90_sent',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ110MediateurId,
      },
      create: {
        id: mediateurCoordinateurJ110MediateurId,
      },
    },
  },
  coordinateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ110CoordinateurId,
      },
      create: {
        id: mediateurCoordinateurJ110CoordinateurId,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c',
      },
      create: {
        id: '4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c',
        structureId: structureEmployeuse.id,
        debut: date,
      },
    },
  },
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
  lieuxActiviteRenseignes: date,
})
