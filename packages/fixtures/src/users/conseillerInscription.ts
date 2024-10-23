import { givenUser } from '../givenUser'
import { centreSocial, mediateque, structureEmployeuse } from '../structures'

export const conseillerInscription = givenUser({
  id: '0658cfe9-93aa-4de8-96a1-613452ac82ea',
  firstName: 'Conseiller Num',
  lastName: 'Inscription',
  isFixture: true,
  role: 'User',
  checkConseillerNumeriqueInscription: new Date(),
  mediateur: {
    connectOrCreate: {
      where: {
        id: 'b119ef9d-5732-4429-8138-5452fe248497',
      },
      create: {
        id: 'b119ef9d-5732-4429-8138-5452fe248497',
        conseillerNumerique: {
          connectOrCreate: {
            where: {
              id: 'conseiller-numerique-inscription',
            },
            create: {
              id: 'conseiller-numerique-inscription',
            },
          },
        },
        enActivite: {
          connectOrCreate: [
            {
              where: {
                id: 'ed40a144-bae0-43fe-9694-3621779d2eca',
              },
              create: {
                id: 'ed40a144-bae0-43fe-9694-3621779d2eca',
                structureId: mediateque.id,
              },
            },
            {
              where: {
                id: '9050bc28-8c5e-46fc-ae21-2be797c6fb73',
              },
              create: {
                id: '9050bc28-8c5e-46fc-ae21-2be797c6fb73',
                structureId: centreSocial.id,
              },
            },
          ],
        },
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '17a2868d-a690-4004-b4cc-7fe132706ae6',
      },
      create: {
        id: '17a2868d-a690-4004-b4cc-7fe132706ae6',
        structureId: structureEmployeuse.id,
      },
    },
  },
})
