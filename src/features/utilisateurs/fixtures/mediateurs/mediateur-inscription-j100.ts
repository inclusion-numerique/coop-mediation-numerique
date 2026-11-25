import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

const day = 24 * 60 * 60 * 1000

const mediateurInscriptionJ100MediateurId =
  '111f13df-229f-4eac-a78c-fe512d759957'

export const mediateurInscriptionJ100 = utilisateur({
  id: '5a3f7d8e-2521-4044-9e1c-33c87258edf1',
  firstName: 'Médiateur',
  lastName: 'Inscription J+100',
  isFixture: true,
  created: new Date(Date.now() - 100 * day),
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurInscriptionJ100MediateurId,
      },
      create: {
        id: mediateurInscriptionJ100MediateurId,
      },
    },
  },
})
