import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 30 * day)

const coordinateurInscritJ30CoordinateurId =
  '49ff8421-e047-4d6f-8c44-75beea254ec0'

export const coordinateurInscritJ30 = utilisateur({
  id: '0ed2058b-a9f0-4959-b7fe-f58ea9eb67e6',
  firstName: 'Coordinateur',
  lastName: 'Inscrit J+30',
  lastLogin: date,
  lastSeen: date,
  isFixture: true,
  role: 'User',
  coordinateur: {
    connectOrCreate: {
      where: {
        id: coordinateurInscritJ30CoordinateurId,
      },
      create: {
        id: coordinateurInscritJ30CoordinateurId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
  profilInscription: 'Coordinateur',
  acceptationCgu: date,
  inscriptionValidee: date,
  structureEmployeuseRenseignee: date,
})
