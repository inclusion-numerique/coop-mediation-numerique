import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 30 * day)

export const coordinateurInscritJ30CoordinateurId =
  '49ff8421-e047-4d6f-8c44-75beea254ec0'

export const coordinateurInscritJ30 = givenUser({
  id: '0ed2058b-a9f0-4959-b7fe-f58ea9eb67e6',
  firstName: 'Coordinateur',
  lastName: 'Inscrit J+30',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritJ30CoordinateurId,
      },
      create: {
        id: coordinateurInscritJ30CoordinateurId,
        derniereCreationActivite: date,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: 'b341c0b3-c2aa-4979-9b9a-f704cb7f5d96',
      },
      create: {
        id: 'b341c0b3-c2aa-4979-9b9a-f704cb7f5d96',
        structureId: structureEmployeuse.id,
        debut: date,
      },
    },
  },
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
})
