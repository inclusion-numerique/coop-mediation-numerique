import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 30 * day)

const mediateurSansActivitesJ30UserId = '7b82183f-58db-4fce-ab07-b481c7304678'

const mediateurSansActivitesJ30MediateurId =
  '728527ba-0e31-41ca-aa8e-82d66b572a80'

export const mediateurSansActivitesJ30 = utilisateur({
  id: mediateurSansActivitesJ30UserId,
  acceptationCgu: date,
  firstName: 'Médiateur',
  lastName: 'Sans activités J+30',
  name: 'Médiateur Sans activités J+30',
  isFixture: true,
  role: 'User',
  created: date,
  inscriptionValidee: date,
  lieuxActiviteRenseignes: date,
  structureEmployeuseRenseignee: date,
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurSansActivitesJ30MediateurId,
      },
      create: {
        id: mediateurSansActivitesJ30MediateurId,
      },
    },
  },
})
