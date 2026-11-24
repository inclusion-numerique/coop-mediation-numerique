import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

export const conseillerNumeriqueMediateurId =
  '1ae07d95-316c-489f-893a-d17052c883b7'

export const conseillerNumerique = utilisateur({
  id: 'b66d2370-4245-4492-a630-02749a98237d',
  isConseillerNumerique: true,
  firstName: 'Conseiller Num',
  lastName: 'Inscrit',
  isFixture: true,
  role: 'User',
  profilInscription: 'ConseillerNumerique',
  acceptationCgu: new Date(),
  structureEmployeuseRenseignee: new Date(),
  lieuxActiviteRenseignes: new Date(),
  inscriptionValidee: new Date(),
  mediateur: {
    connectOrCreate: {
      where: {
        id: conseillerNumeriqueMediateurId,
      },
      create: {
        id: conseillerNumeriqueMediateurId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})
