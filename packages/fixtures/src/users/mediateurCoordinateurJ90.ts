import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 90 * day)

export const mediateurCoordinateurJ90MediateurId =
  '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d'

export const mediateurCoordinateurJ90CoordinateurId =
  '4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e'

export const mediateurCoordinateurJ90 = givenUser({
  id: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
  firstName: 'Médiateur-Coordinateur',
  lastName: 'J+90',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ90MediateurId,
      },
      create: {
        id: mediateurCoordinateurJ90MediateurId,
      },
    },
  },
  coordinateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ90CoordinateurId,
      },
      create: {
        id: mediateurCoordinateurJ90CoordinateurId,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a',
      },
      create: {
        id: '6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a',
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
