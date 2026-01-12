import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 60 * day)

export const coordinateurInscritJ60CoordinateurId =
  'b4e3f9d2-6c85-4a7f-8e2b-7d9c4e5a3b18'

export const coordinateurInscritJ60 = givenUser({
  id: 'd8f5b0e3-4c69-4e82-9d7f-3b2a6c8e1f45',
  firstName: 'Coordinateur',
  lastName: 'Inscrit J+60',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritJ60CoordinateurId,
      },
      create: {
        id: coordinateurInscritJ60CoordinateurId,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: 'e6c4b3d2-8a95-4c9f-9e2a-4d7c6e9b5a38',
      },
      create: {
        id: 'e6c4b3d2-8a95-4c9f-9e2a-4d7c6e9b5a38',
        structureId: structureEmployeuse.id,
      },
    },
  },
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
})
