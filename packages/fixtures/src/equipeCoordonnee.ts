import { givenUser } from './givenUser'
import { mergeUuids } from './mergeUuids'
import { mediateque, structureEmployeuse } from './structures'
import { coordinateurInscritAvecToutCoordinateurId } from './users/coordinateurInscritAvecTout'

const mediateurInviteEnAttenteId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const mediateurInviteEnAttente = givenUser({
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
        enActivite: {
          connectOrCreate: {
            where: { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012' },
            create: {
              id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
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
      where: { id: 'd4e5f6a7-b8c9-0123-def0-234567890123' },
      create: {
        id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
        structureId: structureEmployeuse.id,
        debut: new Date(),
      },
    },
  },
})

export const conseillerNumeriqueActifId = 'e5f6a7b8-c9d0-1234-ef01-345678901234'

const conseillerNumeriqueActif = givenUser({
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
        activitesCount: 15,
        derniereCreationActivite: new Date(),
        enActivite: {
          connectOrCreate: {
            where: { id: 'a7b8c9d0-e1f2-3456-0123-567890123456' },
            create: {
              id: 'a7b8c9d0-e1f2-3456-0123-567890123456',
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
      where: { id: 'b8c9d0e1-f2a3-4567-1234-678901234567' },
      create: {
        id: 'b8c9d0e1-f2a3-4567-1234-678901234567',
        structureId: structureEmployeuse.id,
        debut: new Date(),
      },
    },
  },
})

export const mediateurActifId = 'c9d0e1f2-a3b4-5678-2345-789012345678'

const mediateurActif = givenUser({
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
        activitesCount: 10,
        derniereCreationActivite: new Date(),
        enActivite: {
          connectOrCreate: {
            where: { id: 'e1f2a3b4-c5d6-7890-4567-901234567890' },
            create: {
              id: 'e1f2a3b4-c5d6-7890-4567-901234567890',
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
      where: { id: 'f2a3b4c5-d6e7-8901-5678-012345678901' },
      create: {
        id: 'f2a3b4c5-d6e7-8901-5678-012345678901',
        structureId: structureEmployeuse.id,
        debut: new Date(),
      },
    },
  },
})

const sixMonthsAgo = new Date()
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

export const conseillerNumeriqueInactifMediateurId =
  'a3b4c5d6-e7f8-9012-6789-123456789012'

const conseillerNumeriqueInactif = givenUser({
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
        activitesCount: 2,
        derniereCreationActivite: sixMonthsAgo,
        enActivite: {
          connectOrCreate: {
            where: { id: 'c5d6e7f8-a9b0-1234-8901-345678901234' },
            create: {
              id: 'c5d6e7f8-a9b0-1234-8901-345678901234',
              structureId: mediateque.id,
              debut: sixMonthsAgo,
            },
          },
        },
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: { id: 'd6e7f8a9-b0c1-2345-9012-456789012345' },
      create: {
        id: 'd6e7f8a9-b0c1-2345-9012-456789012345',
        creation: sixMonthsAgo,
        structureId: structureEmployeuse.id,
        debut: sixMonthsAgo,
      },
    },
  },
})

const mediateurInactifMediateurId = 'e7f8a9b0-c1d2-3456-0123-567890123456'

const mediateurInactif = givenUser({
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
        activitesCount: 1,
        derniereCreationActivite: sixMonthsAgo,
        enActivite: {
          connectOrCreate: {
            where: { id: 'a9b0c1d2-e3f4-5678-2345-789012345678' },
            create: {
              id: 'a9b0c1d2-e3f4-5678-2345-789012345678',
              structureId: mediateque.id,
              debut: sixMonthsAgo,
            },
          },
        },
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: { id: 'b0c1d2e3-f4a5-6789-3456-890123456789' },
      create: {
        id: 'b0c1d2e3-f4a5-6789-3456-890123456789',
        creation: sixMonthsAgo,
        structureId: structureEmployeuse.id,
        debut: sixMonthsAgo,
      },
    },
  },
})

const mediateurAQuitteId = 'c1d2e3f4-a5b6-7890-4567-901234567890'

const mediateurAQuitte = givenUser({
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
        activitesCount: 5,
        enActivite: {
          connectOrCreate: {
            where: { id: 'e3f4a5b6-c7d8-9012-6789-123456789012' },
            create: {
              id: 'e3f4a5b6-c7d8-9012-6789-123456789012',
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
      where: { id: 'f4a5b6c7-d8e9-0123-7890-234567890123' },
      create: {
        id: 'f4a5b6c7-d8e9-0123-7890-234567890123',
        structureId: structureEmployeuse.id,
        debut: new Date(),
      },
    },
  },
})

const conseillerNumeriqueAQuitteId = 'a5b6c7d8-e9f0-1234-8901-345678901234'

const conseillerNumeriqueAQuitte = givenUser({
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
        activitesCount: 8,
        enActivite: {
          connectOrCreate: {
            where: { id: 'c7d8e9f0-a1b2-3456-0123-567890123456' },
            create: {
              id: 'c7d8e9f0-a1b2-3456-0123-567890123456',
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
      where: { id: 'd8e9f0a1-b2c3-4567-1234-678901234567' },
      create: {
        id: 'd8e9f0a1-b2c3-4567-1234-678901234567',
        structureId: structureEmployeuse.id,
        debut: new Date(),
      },
    },
  },
})

const mediateurProfilSupprimeId = 'e9f0a1b2-c3d4-5678-2345-789012345678'

const mediateurProfilSupprime = givenUser({
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
        activitesCount: 3,
        enActivite: {
          connectOrCreate: {
            where: { id: 'a1b2c3d4-e5f6-7890-4567-901234567890' },
            create: {
              id: 'a1b2c3d4-e5f6-7890-4567-901234567890',
              structureId: mediateque.id,
              debut: sixMonthsAgo,
            },
          },
        },
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: { id: 'b2c3d4e5-f6a7-8901-5678-012345678901' },
      create: {
        id: 'b2c3d4e5-f6a7-8901-5678-012345678901',
        structureId: structureEmployeuse.id,
        debut: sixMonthsAgo,
      },
    },
  },
})

const conseillerNumeriqueProfilSupprimeId =
  'c3d4e5f6-a7b8-9012-6789-012345678901'

const conseillerNumeriqueProfilSupprime = givenUser({
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
        activitesCount: 6,
        enActivite: {
          connectOrCreate: {
            where: { id: 'e5f6a7b8-c9d0-1234-8901-234567890123' },
            create: {
              id: 'e5f6a7b8-c9d0-1234-8901-234567890123',
              structureId: mediateque.id,
              debut: sixMonthsAgo,
            },
          },
        },
      },
    },
  },
  emplois: {
    connectOrCreate: {
      where: { id: 'f6a7b8c9-d0e1-2345-9012-345678901234' },
      create: {
        id: 'f6a7b8c9-d0e1-2345-9012-345678901234',
        structureId: structureEmployeuse.id,
        debut: sixMonthsAgo,
      },
    },
  },
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

export const equipeCordonneeIds = [
  conseillerNumeriqueActifId,
  mediateurActifId,
  conseillerNumeriqueInactifMediateurId,
  mediateurInactifMediateurId,
  mediateurProfilSupprimeId,
  conseillerNumeriqueProfilSupprimeId,
]

export const quitterEquipe = [
  {
    id: mergeUuids(
      coordinateurInscritAvecToutCoordinateurId,
      mediateurAQuitteId,
    ),
    coordinateurId: coordinateurInscritAvecToutCoordinateurId,
    mediateurId: mediateurAQuitteId,
    suppression: new Date(),
  },
  {
    id: mergeUuids(
      coordinateurInscritAvecToutCoordinateurId,
      conseillerNumeriqueAQuitteId,
    ),
    coordinateurId: coordinateurInscritAvecToutCoordinateurId,
    mediateurId: conseillerNumeriqueAQuitteId,
    suppression: new Date(),
  },
]

export const invitationsEquipe = [
  {
    email: 'invitation-attente@test.fr',
    coordinateurId: coordinateurInscritAvecToutCoordinateurId,
    mediateurId: mediateurInviteEnAttenteId,
  },
  {
    email: 'personne.sans-compte@test.fr',
    coordinateurId: coordinateurInscritAvecToutCoordinateurId,
    mediateurId: null,
  },
]
