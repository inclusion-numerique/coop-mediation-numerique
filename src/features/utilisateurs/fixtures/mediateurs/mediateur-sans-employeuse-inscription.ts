import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

const mediateurSansEmployeuseInscriptionMediateurId =
  'b7e0a2c1-58d3-4f6e-9a41-2c5d8e0f3b74'

const mediateurSansEmployeuseInscriptionEmail =
  'mediateur-sans-employeuse@coop-numerique.anct.gouv.fr'

export const mediateurSansEmployeuseInscription = utilisateur({
  id: 'ec2a1d4f-9b63-4e58-8a07-6f1c9d2b4e35',
  firstName: 'Médiateur',
  lastName: 'Sans employeuse',
  isFixture: true,
  email: mediateurSansEmployeuseInscriptionEmail,
  role: 'User',
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurSansEmployeuseInscriptionMediateurId,
      },
      create: {
        id: mediateurSansEmployeuseInscriptionMediateurId,
      },
    },
  },
})
