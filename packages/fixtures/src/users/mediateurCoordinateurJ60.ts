import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 60 * day)

export const mediateurCoordinateurJ60MediateurId =
  '9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f'

export const mediateurCoordinateurJ60CoordinateurId =
  '0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a'

export const mediateurCoordinateurJ60 = givenUser({
  id: '1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
  firstName: 'Médiateur-Coordinateur',
  lastName: 'J+60',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ60MediateurId,
      },
      create: {
        id: mediateurCoordinateurJ60MediateurId,
      },
    },
  },
  coordinateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ60CoordinateurId,
      },
      create: {
        id: mediateurCoordinateurJ60CoordinateurId,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
      },
      create: {
        id: '2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
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
