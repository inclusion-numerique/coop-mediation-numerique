import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 110 * day)

export const mediateurSansActivitesJ110UserId =
  'c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f'

export const mediateurSansActivitesJ110MediateurId =
  'd3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a'

export const mediateurSansActivitesJ110 = givenUser({
  id: mediateurSansActivitesJ110UserId,
  acceptationCgu: date,
  firstName: 'Médiateur',
  lastName: 'Sans activités J+110',
  name: 'Médiateur Sans activités J+110',
  isFixture: true,
  role: 'User',
  created: date,
  inscriptionValidee: date,
  lieuxActiviteRenseignes: date,
  structureEmployeuseRenseignee: date,
  onboardingStatus: 'warning_j90_sent',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurSansActivitesJ110MediateurId,
      },
      create: {
        id: mediateurSansActivitesJ110MediateurId,
      },
    },
  },
})
