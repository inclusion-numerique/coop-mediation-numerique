import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 110 * day)

export const coordinateurInscritJ110CoordinateurId =
  'd6e5f1e4-8e07-4c9f-0e4d-9f1e6e7b5d30'

export const coordinateurInscritJ110 = givenUser({
  id: 'f0e7d2e5-6e8b-4e04-9f1c-5d4b8e0f3e67',
  firstName: 'Coordinateur',
  lastName: 'Inscrit J+110',
  lastLogin: date,
  lastSeen: date,
  isFixture: true,
  role: 'User',
  onboardingStatus: 'warning_j90_sent',
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritJ110CoordinateurId,
      },
      create: {
        id: coordinateurInscritJ110CoordinateurId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
})
