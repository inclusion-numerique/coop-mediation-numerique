import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 7 * day)

export const mediateurCoordinateurJ7MediateurId =
  '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'

export const mediateurCoordinateurJ7CoordinateurId =
  '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e'

export const mediateurCoordinateurJ7 = givenUser({
  id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
  firstName: 'Médiateur-Coordinateur',
  lastName: 'J+7',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ7MediateurId,
      },
      create: {
        id: mediateurCoordinateurJ7MediateurId,
      },
    },
  },
  coordinateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ7CoordinateurId,
      },
      create: {
        id: mediateurCoordinateurJ7CoordinateurId,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
      },
      create: {
        id: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
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
