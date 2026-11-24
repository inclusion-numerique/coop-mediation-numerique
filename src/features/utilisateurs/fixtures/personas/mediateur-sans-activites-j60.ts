import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

const day = 24 * 60 * 60 * 1000
const date = new Date(Date.now() - 60 * day)

const mediateurSansActivitesJ60UserId = '83211680-12d5-4b4b-ad5f-0f2233f3eca9'

const mediateurSansActivitesJ60MediateurId =
  '451905b9-0c54-4a75-8f02-77091c87728c'

export const mediateurSansActivitesJ60 = utilisateur({
  id: mediateurSansActivitesJ60UserId,
  acceptationCgu: date,
  firstName: 'Médiateur',
  lastName: 'Sans activités J+60',
  name: 'Médiateur Sans activités J+60',
  isFixture: true,
  role: 'User',
  created: date,
  inscriptionValidee: date,
  lieuxActiviteRenseignes: date,
  structureEmployeuseRenseignee: date,
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurSansActivitesJ60MediateurId,
      },
      create: {
        id: mediateurSansActivitesJ60MediateurId,
      },
    },
  },
})
