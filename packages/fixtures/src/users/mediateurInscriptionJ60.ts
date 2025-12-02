import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000

export const mediateurInscriptionJ60MediateurId =
  'c2dc8edd-8298-492f-b8e1-15599b38e43b'

export const mediateurInscriptionJ60 = givenUser({
  id: '9197ce73-d9cc-41bd-8c48-5db85193240a',
  firstName: 'Médiateur',
  lastName: 'Inscription J+60',
  isFixture: true,
  created: new Date(Date.now() - 60 * day),
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurInscriptionJ60MediateurId,
      },
      create: {
        id: mediateurInscriptionJ60MediateurId,
      },
    },
  },
})
