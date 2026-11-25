import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

export const coordinateurHorsDispositifInscritAvecToutCoordinateurId =
  'aa792475-7201-473a-af4a-7d3236539bfd'

export const coordinateurHorsDispositifInscritAvecToutMediateurId =
  '63c5708d-fb96-48d4-a356-250c150c06de'

export const coordinateurHorsDispositifInscritAvecTout = utilisateur({
  id: 'f878b0e1-f31e-4a15-bbca-e8be80b0d19e',
  firstName: 'Coordinateur hors dispositif',
  lastName: 'Inscrit avec tout',
  lastLogin: new Date(),
  lastSeen: new Date(),
  isFixture: true,
  role: 'User',
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurHorsDispositifInscritAvecToutCoordinateurId,
      },
      create: {
        id: coordinateurHorsDispositifInscritAvecToutCoordinateurId,
      },
    },
  },
  mediateur: {
    connectOrCreate: {
      where: {
        id: coordinateurHorsDispositifInscritAvecToutMediateurId,
      },
      create: {
        id: coordinateurHorsDispositifInscritAvecToutMediateurId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
  profilInscription: 'Coordinateur',
  acceptationCgu: new Date(),
  inscriptionValidee: new Date(),
  structureEmployeuseRenseignee: new Date(),
})
