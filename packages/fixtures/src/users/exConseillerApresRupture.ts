import { givenUser } from '../givenUser'
import { mediateque, structureEmployeuse } from '../structures'

export const exConseillerApresRuptureMediateurId =
  '594f05c4-47d8-4d4a-9d52-26396da59e5a'

export const exConseillerApresRupture = givenUser({
  id: '28c91a4e-99ee-4d75-9af9-08993c01490e',
  acceptationCgu: new Date(),
  firstName: 'Ex Conseiller',
  lastName: 'Après Rupture',
  isFixture: true,
  role: 'User',
  profilInscription: 'ConseillerNumerique',
  inscriptionValidee: new Date(),
  lieuxActiviteRenseignes: new Date(),
  structureEmployeuseRenseignee: new Date(),
  mediateur: {
    connectOrCreate: {
      where: {
        id: exConseillerApresRuptureMediateurId,
      },
      create: {
        id: exConseillerApresRuptureMediateurId,
        isVisible: true,
        enActivite: {
          connectOrCreate: {
            where: {
              id: '01e3e68a-b42b-4d00-bcb7-e51c5f682371',
            },
            create: {
              id: '01e3e68a-b42b-4d00-bcb7-e51c5f682371',
              structureId: mediateque.id,
              debut: new Date(),
            },
          },
        },
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: {
        id: '177d782e-5212-4b83-a94e-5a9e358816fb',
      },
      create: {
        id: '177d782e-5212-4b83-a94e-5a9e358816fb',
        structureId: structureEmployeuse.id,
        debut: new Date(),
      },
    },
  },
})

export const contratRompuDeLExConseiller = {
  coopId: exConseillerApresRupture.id,
  dateDebut: new Date('2024-01-01'),
  dateRupture: new Date('2026-09-01'),
}
