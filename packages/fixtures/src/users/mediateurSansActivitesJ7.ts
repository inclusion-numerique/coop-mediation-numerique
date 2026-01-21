import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 7 * day)

export const mediateurSansActivitesJ7UserId =
  '4d002fbd-32ef-4543-a5b7-f2e42bec5fbc'

export const mediateurSansActivitesJ7MediateurId =
  '38bf24d5-5bb6-4aad-87ff-d57877724799'

export const mediateurSansActivitesJ7 = givenUser({
  id: mediateurSansActivitesJ7UserId,
  acceptationCgu: date,
  firstName: 'Médiateur',
  lastName: 'Sans activités J+7',
  name: 'Médiateur Sans activités J+7',
  isFixture: true,
  role: 'User',
  created: date,
  inscriptionValidee: date,
  lieuxActiviteRenseignes: date,
  structureEmployeuseRenseignee: date,
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurSansActivitesJ7MediateurId,
      },
      create: {
        id: mediateurSansActivitesJ7MediateurId,
      },
    },
  },
})
