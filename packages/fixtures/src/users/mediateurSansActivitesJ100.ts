import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 100 * day)

export const mediateurSansActivitesJ100UserId =
  'a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d'

export const mediateurSansActivitesJ100MediateurId =
  'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e'

export const mediateurSansActivitesJ100 = givenUser({
  id: mediateurSansActivitesJ100UserId,
  acceptationCgu: date,
  firstName: 'Médiateur',
  lastName: 'Sans activités J+100',
  name: 'Médiateur Sans activités J+100',
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
        id: mediateurSansActivitesJ100MediateurId,
      },
      create: {
        id: mediateurSansActivitesJ100MediateurId,
      },
    },
  },
})
