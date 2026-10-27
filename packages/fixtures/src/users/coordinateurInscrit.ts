import { givenUser } from '../givenUser'

export const coordinateurInscritCoordinateurId =
  'c2a5a5f3-56be-4632-9253-880fb3ff9ea4'

export const coordinateurInscrit = givenUser({
  id: '28bd02a6-7096-4453-9cc3-5eb4f6efc955',
  firstName: 'Coordinateur',
  lastName: 'Inscrit',
  lastLogin: new Date(),
  lastSeen: new Date(),
  isFixture: true,
  role: 'User',
  isConseillerNumerique: true,
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritCoordinateurId,
      },
      create: {
        id: coordinateurInscritCoordinateurId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
  profilInscription: 'Coordinateur',
  acceptationCgu: new Date(),
  inscriptionValidee: new Date(),
  structureEmployeuseRenseignee: new Date(),
})
