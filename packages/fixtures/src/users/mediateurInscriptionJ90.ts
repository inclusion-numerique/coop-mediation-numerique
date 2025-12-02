import { givenUser } from '../givenUser'

const day = 24 * 60 * 60 * 1000

export const mediateurInscriptionJ90MediateurId =
  'c76348eb-a5f0-46e8-92c8-c35bb4b88f94'

export const mediateurInscriptionJ90 = givenUser({
  id: 'e1af39c4-b56a-455a-a455-fda02036c5dd',
  firstName: 'Médiateur',
  lastName: 'Inscription J+90',
  isFixture: true,
  created: new Date(Date.now() - 90 * day),
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurInscriptionJ90MediateurId,
      },
      create: {
        id: mediateurInscriptionJ90MediateurId,
      },
    },
  },
})
