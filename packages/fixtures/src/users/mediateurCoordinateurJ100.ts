import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 100 * day)

export const mediateurCoordinateurJ100MediateurId =
  '7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b'

export const mediateurCoordinateurJ100CoordinateurId =
  '8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c'

export const mediateurCoordinateurJ100 = givenUser({
  id: '9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d',
  firstName: 'Médiateur-Coordinateur',
  lastName: 'J+100',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  onboardingStatus: 'warning_j90_sent',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ100MediateurId,
      },
      create: {
        id: mediateurCoordinateurJ100MediateurId,
      },
    },
  },
  coordinateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ100CoordinateurId,
      },
      create: {
        id: mediateurCoordinateurJ100CoordinateurId,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e',
      },
      create: {
        id: '0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e',
        structureId: structureEmployeuse.id,
      },
    },
  },
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
  lieuxActiviteRenseignes: date,
})
