import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

export const idDuMediateurSansActivites = 'd3378267-18cf-4b5f-ae1e-9f63c7093ac2'

export const mediateurSansActivitesMediateurId =
  'c513c349-46dc-461a-a3dc-a81d53c459b6'

export const mediateurSansActivites = utilisateur({
  id: idDuMediateurSansActivites,
  acceptationCgu: new Date(),
  firstName: 'Médiateur',
  lastName: 'Sans activités',
  name: 'Médiateur Sans activités',
  email: 'mediation@numerique.fr',
  isFixture: true,
  role: 'User',
  inscriptionValidee: new Date(),
  lieuxActiviteRenseignes: new Date(),
  structureEmployeuseRenseignee: new Date(),
  isConseillerNumerique: false,
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurSansActivitesMediateurId,
      },
      create: {
        id: mediateurSansActivitesMediateurId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})
