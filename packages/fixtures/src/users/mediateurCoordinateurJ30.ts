import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 30 * day)

export const mediateurCoordinateurJ30MediateurId =
  '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b'

export const mediateurCoordinateurJ30CoordinateurId =
  '6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c'

export const mediateurCoordinateurJ30 = givenUser({
  id: '7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
  firstName: 'Médiateur-Coordinateur',
  lastName: 'J+30',
  lastLogin: date,
  lastSeen: date,
  isFixture: true,
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ30MediateurId,
      },
      create: {
        id: mediateurCoordinateurJ30MediateurId,
      },
    },
  },
  coordinateur: {
    connectOrCreate: {
      where: {
        id: mediateurCoordinateurJ30CoordinateurId,
      },
      create: {
        id: mediateurCoordinateurJ30CoordinateurId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
  lieuxActiviteRenseignes: date,
})
