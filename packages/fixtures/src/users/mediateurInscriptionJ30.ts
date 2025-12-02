import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000

export const mediateurInscriptionJ30MediateurId =
  '186aab38-7eaf-4438-a834-0d9b021030f1'

export const mediateurInscriptionJ30 = givenUser({
  id: 'fcf795f5-7890-4d81-bf01-30d67513d889',
  firstName: 'Médiateur',
  lastName: 'Inscription J+30',
  isFixture: true,
  created: new Date(Date.now() - 30 * day),
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurInscriptionJ30MediateurId,
      },
      create: {
        id: mediateurInscriptionJ30MediateurId,
      },
    },
  },
})
