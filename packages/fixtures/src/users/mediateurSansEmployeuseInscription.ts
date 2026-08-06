import { givenUser } from '../givenUser'

export const mediateurSansEmployeuseInscriptionMediateurId =
  'b7e0a2c1-58d3-4f6e-9a41-2c5d8e0f3b74'

export const mediateurSansEmployeuseInscriptionEmail =
  'mediateur-sans-employeuse@coop-numerique.anct.gouv.fr'

/**
 * Médiateur qui s'inscrit sans employeuse connue : ni SIRET ProConnect, ni emploi
 * seedé, donc aucune affectation dans `main`.
 *
 * C'est le seul cas qui emprunte l'étape « renseigner votre structure
 * employeuse » — les autres utilisateurs d'inscription portent un SIRET, dont
 * l'initialisation déduit leur employeuse, et l'étape est alors sautée.
 */
export const mediateurSansEmployeuseInscription = givenUser({
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
