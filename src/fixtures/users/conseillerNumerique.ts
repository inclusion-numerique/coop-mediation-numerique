import { givenUser } from '@/features/utilisateurs/fixtures/givenUser'
import { centreSocial, mediateque } from '@/fixtures/structures'

export const conseillerNumeriqueMediateurId =
  '1ae07d95-316c-489f-893a-d17052c883b7'

export const conseillerNumerique = givenUser({
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
        enActivite: {
          connectOrCreate: [
            {
              where: {
                id: '86643b16-de10-421e-b056-d820994572d1',
              },
              create: {
                id: '86643b16-de10-421e-b056-d820994572d1',
                structureId: mediateque.id,
                debut: new Date(),
              },
            },
            {
              where: {
                id: 'ef672b71-807b-41a6-9aca-3fac76478616',
              },
              create: {
                id: 'ef672b71-807b-41a6-9aca-3fac76478616',
                structureId: centreSocial.id,
                debut: new Date(),
              },
            },
          ],
        },
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})
