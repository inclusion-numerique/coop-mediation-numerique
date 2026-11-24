import { utilisateur } from '@/features/utilisateurs/fixtures/utilisateur'

const mediateurInviteEnAttenteId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const mediateurInviteEnAttente = utilisateur({
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  firstName: 'Médiateur',
  lastName: 'Invitation En Attente',
  email: 'invitation-en-attente@coop-numerique.anct.gouv.fr',
  isFixture: true,
  role: 'User',
  profilInscription: 'Mediateur',
  acceptationCgu: new Date(),
  structureEmployeuseRenseignee: new Date(),
  lieuxActiviteRenseignes: new Date(),
  inscriptionValidee: new Date(),
  mediateur: {
    connectOrCreate: {
      where: { id: mediateurInviteEnAttenteId },
      create: {
        id: mediateurInviteEnAttenteId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

const conseillerNumeriqueActifId = 'e5f6a7b8-c9d0-1234-ef01-345678901234'

const conseillerNumeriqueActif = utilisateur({
  id: 'f6a7b8c9-d0e1-2345-f012-456789012345',
  firstName: 'Conum',
  lastName: 'Actif',
  email: 'conum-actif@coop-numerique.anct.gouv.fr',
  isFixture: true,
  role: 'User',
  isConseillerNumerique: true,
  profilInscription: 'ConseillerNumerique',
  acceptationCgu: new Date(),
  structureEmployeuseRenseignee: new Date(),
  lieuxActiviteRenseignes: new Date(),
  inscriptionValidee: new Date(),
  mediateur: {
    connectOrCreate: {
      where: { id: conseillerNumeriqueActifId },
      create: {
        id: conseillerNumeriqueActifId,
        derniereCreationActivite: new Date(),
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

const mediateurActifId = 'c9d0e1f2-a3b4-5678-2345-789012345678'

const mediateurActif = utilisateur({
  id: 'd0e1f2a3-b4c5-6789-3456-890123456789',
  firstName: 'Médiateur',
  lastName: 'Actif',
  email: 'actif@coop-numerique.anct.gouv.fr',
  isFixture: true,
  role: 'User',
  profilInscription: 'Mediateur',
  acceptationCgu: new Date(),
  structureEmployeuseRenseignee: new Date(),
  lieuxActiviteRenseignes: new Date(),
  inscriptionValidee: new Date(),
  mediateur: {
    connectOrCreate: {
      where: { id: mediateurActifId },
      create: {
        id: mediateurActifId,
        derniereCreationActivite: new Date(),
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

const sixMonthsAgo = new Date()
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

const conseillerNumeriqueInactifMediateurId =
  'a3b4c5d6-e7f8-9012-6789-123456789012'

const conseillerNumeriqueInactif = utilisateur({
  id: 'b4c5d6e7-f8a9-0123-7890-234567890123',
  firstName: 'Conum',
  lastName: 'Inactif',
  email: 'conum-inactif@coop-numerique.anct.gouv.fr',
  isFixture: true,
  role: 'User',
  isConseillerNumerique: true,
  profilInscription: 'ConseillerNumerique',
  created: sixMonthsAgo,
  lastLogin: sixMonthsAgo,
  acceptationCgu: sixMonthsAgo,
  structureEmployeuseRenseignee: sixMonthsAgo,
  lieuxActiviteRenseignes: sixMonthsAgo,
  inscriptionValidee: sixMonthsAgo,
  mediateur: {
    connectOrCreate: {
      where: { id: conseillerNumeriqueInactifMediateurId },
      create: {
        id: conseillerNumeriqueInactifMediateurId,
        creation: sixMonthsAgo,
        derniereCreationActivite: sixMonthsAgo,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

const mediateurInactifMediateurId = 'e7f8a9b0-c1d2-3456-0123-567890123456'

const mediateurInactif = utilisateur({
  id: 'f8a9b0c1-d2e3-4567-1234-678901234567',
  firstName: 'Médiateur',
  lastName: 'Inactif',
  email: 'inactif@coop-numeriquderniereCreationActivitee.anct.gouv.fr',
  isFixture: true,
  role: 'User',
  profilInscription: 'Mediateur',
  created: sixMonthsAgo,
  lastLogin: sixMonthsAgo,
  acceptationCgu: sixMonthsAgo,
  structureEmployeuseRenseignee: sixMonthsAgo,
  lieuxActiviteRenseignes: sixMonthsAgo,
  inscriptionValidee: sixMonthsAgo,
  mediateur: {
    connectOrCreate: {
      where: { id: mediateurInactifMediateurId },
      create: {
        id: mediateurInactifMediateurId,
        creation: sixMonthsAgo,
        derniereCreationActivite: sixMonthsAgo,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

const mediateurAQuitteId = 'c1d2e3f4-a5b6-7890-4567-901234567890'

const mediateurAQuitte = utilisateur({
  id: 'd2e3f4a5-b6c7-8901-5678-012345678901',
  firstName: 'Médiateur',
  lastName: 'A Quitté l’Équipe',
  email: 'a-quitte@coop-numerique.anct.gouv.fr',
  isFixture: true,
  role: 'User',
  profilInscription: 'Mediateur',
  acceptationCgu: new Date(),
  structureEmployeuseRenseignee: new Date(),
  lieuxActiviteRenseignes: new Date(),
  inscriptionValidee: new Date(),
  mediateur: {
    connectOrCreate: {
      where: { id: mediateurAQuitteId },
      create: {
        id: mediateurAQuitteId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

const conseillerNumeriqueAQuitteId = 'a5b6c7d8-e9f0-1234-8901-345678901234'

const conseillerNumeriqueAQuitte = utilisateur({
  id: 'b6c7d8e9-f0a1-2345-9012-456789012345',
  firstName: 'Conum',
  lastName: 'A Quitté l’Équipe',
  email: 'conum-a-quitte@coop-numerique.anct.gouv.fr',
  isFixture: true,
  role: 'User',
  isConseillerNumerique: true,
  profilInscription: 'ConseillerNumerique',
  acceptationCgu: new Date(),
  structureEmployeuseRenseignee: new Date(),
  lieuxActiviteRenseignes: new Date(),
  inscriptionValidee: new Date(),
  mediateur: {
    connectOrCreate: {
      where: { id: conseillerNumeriqueAQuitteId },
      create: {
        id: conseillerNumeriqueAQuitteId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

const mediateurProfilSupprimeId = 'e9f0a1b2-c3d4-5678-2345-789012345678'

const mediateurProfilSupprime = utilisateur({
  id: 'f0a1b2c3-d4e5-6789-3456-890123456789',
  firstName: 'Utilisateur',
  lastName: 'Supprimé',
  email: 'supprime@coop-numerique.anct.gouv.fr',
  isFixture: true,
  role: 'User',
  profilInscription: 'Mediateur',
  created: sixMonthsAgo,
  lastLogin: sixMonthsAgo,
  acceptationCgu: sixMonthsAgo,
  structureEmployeuseRenseignee: sixMonthsAgo,
  lieuxActiviteRenseignes: sixMonthsAgo,
  inscriptionValidee: sixMonthsAgo,
  deleted: new Date(),
  mediateur: {
    connectOrCreate: {
      where: { id: mediateurProfilSupprimeId },
      create: {
        id: mediateurProfilSupprimeId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

const conseillerNumeriqueProfilSupprimeId =
  'c3d4e5f6-a7b8-9012-6789-012345678901'

const conseillerNumeriqueProfilSupprime = utilisateur({
  id: 'd4e5f6a7-b8c9-0123-7890-123456789012',
  firstName: 'Utilisateur',
  lastName: 'Supprimé',
  email: 'conum-supprime@coop-numerique.anct.gouv.fr',
  isFixture: true,
  role: 'User',
  isConseillerNumerique: true,
  profilInscription: 'ConseillerNumerique',
  created: sixMonthsAgo,
  lastLogin: sixMonthsAgo,
  acceptationCgu: sixMonthsAgo,
  structureEmployeuseRenseignee: sixMonthsAgo,
  lieuxActiviteRenseignes: sixMonthsAgo,
  inscriptionValidee: sixMonthsAgo,
  deleted: new Date(),
  mediateur: {
    connectOrCreate: {
      where: { id: conseillerNumeriqueProfilSupprimeId },
      create: {
        id: conseillerNumeriqueProfilSupprimeId,
      },
    },
  },
  employeDeLaStructureEmployeuse: true,
})

export const equipeCoordonnee = [
  mediateurInviteEnAttente,
  conseillerNumeriqueActif,
  mediateurActif,
  conseillerNumeriqueInactif,
  mediateurInactif,
  mediateurAQuitte,
  conseillerNumeriqueAQuitte,
  mediateurProfilSupprime,
  conseillerNumeriqueProfilSupprime,
]

export const membresDeLEquipeCoordonnee = {
  inviteEnAttente: mediateurInviteEnAttenteId,
  conseillerNumeriqueActif: conseillerNumeriqueActifId,
  mediateurActif: mediateurActifId,
  conseillerNumeriqueInactif: conseillerNumeriqueInactifMediateurId,
  mediateurInactif: mediateurInactifMediateurId,
  mediateurAQuitte: mediateurAQuitteId,
  conseillerNumeriqueAQuitte: conseillerNumeriqueAQuitteId,
  mediateurProfilSupprime: mediateurProfilSupprimeId,
  conseillerNumeriqueProfilSupprime: conseillerNumeriqueProfilSupprimeId,
}
