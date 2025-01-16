import { givenUser } from '../givenUser'

export const mediateurInscriptionMediateurId =
  '77ae444f-574c-4fcc-87cb-4f792725a496'

export const mediateurInscriptionWithMediateur = givenUser({
  id: 'fd139d0a-8b52-47c8-820e-716b611564fc',
  firstName: 'Médiateur',
  lastName: 'Inscription with médiateur',
  isFixture: true,
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurInscriptionMediateurId,
      },
      create: {
        id: mediateurInscriptionMediateurId,
      },
    },
  },
})
