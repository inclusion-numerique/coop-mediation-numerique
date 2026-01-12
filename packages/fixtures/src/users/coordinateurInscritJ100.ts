import { givenUser } from '../givenUser'
import { structureEmployeuse } from '../structures'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 100 * day)

export const coordinateurInscritJ100CoordinateurId =
  'c5f4e0d3-7d96-4b8e-9f3c-8e0d5f6a4c29'

export const coordinateurInscritJ100 = givenUser({
  id: 'e9f6c1d4-5d7a-4f93-8e0b-4c3a7d9e2f56',
  firstName: 'Coordinateur',
  lastName: 'Inscrit J+100',
  lastLogin: date,
  isFixture: true,
  role: 'User',
  onboardingStatus: 'warning_j90_sent',
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritJ100CoordinateurId,
      },
      create: {
        id: coordinateurInscritJ100CoordinateurId,
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: 'f7d5c4e3-9b06-4d0e-0f3b-5e8c7f0a6b49',
      },
      create: {
        id: 'f7d5c4e3-9b06-4d0e-0f3b-5e8c7f0a6b49',
        structureId: structureEmployeuse.id,
      },
    },
  },
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
})
