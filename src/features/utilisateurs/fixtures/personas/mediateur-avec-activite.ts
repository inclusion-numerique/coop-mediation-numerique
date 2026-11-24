import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

const mediateurAvecActiviteUserId = 'd10844c6-b6de-402a-a68d-f8328b1d1b0c'

export const mediateurAvecActiviteMediateurId =
  '303381cc-3da7-433d-a553-1a5f76465989'

export const mediateurAvecActivite = utilisateur({
  id: mediateurAvecActiviteUserId,
  acceptationCgu: new Date(),
  firstName: 'Médiateur',
  lastName: 'Avec activités',
  isFixture: true,
  role: 'User',
  inscriptionValidee: new Date(),
  lieuxActiviteRenseignes: new Date(),
  structureEmployeuseRenseignee: new Date(),
  mediateur: {
    connectOrCreate: {
      where: {
        id: mediateurAvecActiviteMediateurId,
      },
      create: {
        id: mediateurAvecActiviteMediateurId,
        derniereCreationActivite: new Date(),
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})
