import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

export const exConseillerApresRuptureMediateurId =
  '594f05c4-47d8-4d4a-9d52-26396da59e5a'

export const exConseillerApresRupture = utilisateur({
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
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

export const contratRompuDeLExConseiller = {
  coopId: exConseillerApresRupture.id,
  dateDebut: new Date('2024-01-01'),
  dateRupture: new Date('2026-09-01'),
}
