import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 30 * day)

export const mediateurSansActivitesJ30UserId =
  '7b82183f-58db-4fce-ab07-b481c7304678'

export const mediateurSansActivitesJ30MediateurId =
  '728527ba-0e31-41ca-aa8e-82d66b572a80'

export const mediateurSansActivitesJ30 = givenUser({
  id: mediateurSansActivitesJ30UserId,
  acceptationCgu: date,
  firstName: 'Médiateur',
  lastName: 'Sans activités J+30',
  name: 'Médiateur Sans activités J+30',
  email: 'mediation@numeriqueJ30.fr',
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
