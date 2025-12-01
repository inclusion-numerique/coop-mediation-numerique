import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000

export const mediateurInscriptionJ7MediateurId =
  '3a4b4d98-cd17-4ed4-9610-38dd2dcb1798'

export const mediateurInscriptionJ7 = givenUser({
  id: '46ec08fb-7f5f-4159-8bba-0230d8d42b8f',
  firstName: 'Médiateur',
  lastName: 'Inscription J+7',
  isFixture: true,
  created: new Date(Date.now() - 7 * day),
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurInscriptionJ7MediateurId,
      },
      create: {
        id: mediateurInscriptionJ7MediateurId,
      },
    },
  },
})
