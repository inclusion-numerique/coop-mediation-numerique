import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 100 * day)

export const coordinateurInscritJ100CoordinateurId =
  'c5f4e0d3-7d96-4b8e-9f3c-8e0d5f6a4c29'

export const coordinateurInscritJ100 = givenUser({
  id: 'e9f6c1d4-5d7a-4f93-8e0b-4c3a7d9e2f56',
  firstName: 'Coordinateur',
  lastName: 'Inscrit J+100',
  lastLogin: date,
  lastSeen: date,
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
  employeDeLaStructureEmployeuse: true,
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
})
