import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 90 * day)

export const mediateurSansActivitesJ90UserId =
  '9e4f3969-9d40-40e3-8e58-e54d7a5bd2cf'

export const mediateurSansActivitesJ90MediateurId =
  'd052fe20-7fc5-4f2e-bcc0-94d0602a0b53'

export const mediateurSansActivitesJ90 = givenUser({
  id: mediateurSansActivitesJ90UserId,
  acceptationCgu: date,
  firstName: 'Médiateur',
  lastName: 'Sans activités J+90',
  name: 'Médiateur Sans activités J+90',
  isFixture: true,
  role: 'User',
  created: date,
  inscriptionValidee: date,
  lieuxActiviteRenseignes: date,
  structureEmployeuseRenseignee: date,
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurSansActivitesJ90MediateurId,
      },
      create: {
        id: mediateurSansActivitesJ90MediateurId,
      },
    },
  },
})
