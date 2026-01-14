import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 7 * day)

export const coordinateurInscritJ7CoordinateurId =
  'a3f2e8d1-5c94-4b7e-9f3a-6d8c1e4b2a09'

export const coordinateurInscritJ7 = givenUser({
  id: 'c7e4a9f2-3b58-4d91-8c6e-2a1f5d9b7e34',
  firstName: 'Coordinateur',
  lastName: 'Inscrit J+7',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritJ7CoordinateurId,
      },
      create: {
        id: coordinateurInscritJ7CoordinateurId,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: 'f5d3a2e1-7c94-4b8e-9f1a-3d6c5e8b4a27',
      },
      create: {
        id: 'f5d3a2e1-7c94-4b8e-9f1a-3d6c5e8b4a27',
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
