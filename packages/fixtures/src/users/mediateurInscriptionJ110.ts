import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000

export const mediateurInscriptionJ110MediateurId =
  '8af3b587-1eeb-48d9-b2d3-9500f026fafd'

export const mediateurInscriptionJ110 = givenUser({
  id: '4dc301be-e2d6-4290-8d91-6d06126d948a',
  firstName: 'Médiateur',
  lastName: 'Inscription J+110',
  isFixture: true,
  created: new Date(Date.now() - 110 * day),
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurInscriptionJ110MediateurId,
      },
      create: {
        id: mediateurInscriptionJ110MediateurId,
      },
    },
  },
})
