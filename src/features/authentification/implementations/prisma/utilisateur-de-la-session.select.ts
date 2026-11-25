import type { Prisma } from '@/generated/prisma/client'

export const utilisateurDeLaSessionSelect = {
  id: true,
  email: true,
  phone: true,
  siret: true,
  firstName: true,
  lastName: true,
  name: true,
  emailVerified: true,
  created: true,
  updated: true,
  role: true,
  isFixture: true,
  profilInscription: true,
  acceptationCgu: true,
  hasSeenOnboarding: true,
  structureEmployeuseRenseignee: true,
  lieuxActiviteRenseignes: true,
  inscriptionValidee: true,
  timezone: true,
  lastSeen: true,
  personneMain: {
    select: {
      employeuseActuelle: {
        select: { structureAdministrativeId: true, nom: true, codeInsee: true },
      },
      conseillerNumeriqueEnPoste: { select: { personneId: true } },
    },
  },
  mediateur: {
    select: {
      id: true,
      isVisible: true,
      coordinations: {
        where: { suppression: null },
        select: {
          coordinateur: {
            select: {
              id: true,
              mediateursCoordonnes: {
                select: {
                  id: true,
                  mediateurId: true,
                  suppression: true,
                },
                where: {
                  suppression: null,
                },
              },
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          enActivite: { where: { suppression: null, fin: null } },
        },
      },
    },
  },
  coordinateur: {
    select: {
      id: true,
      mediateursCoordonnes: {
        select: {
          mediateurId: true,
          suppression: true,
        },
      },
    },
  },
  rdvAccount: {
    select: {
      id: true,
      created: true,
      updated: true,
      lastSynced: true,
      accessToken: true,
      refreshToken: true,
      deleted: true,
      error: true,
      syncFrom: true,
      includeRdvsInActivitesList: true,
      organisations: {
        select: {
          organisation: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      invalidWebhookOrganisationIds: true,
    },
  },
} satisfies Prisma.UserSelect

export type UtilisateurDeLaSessionRow = Prisma.UserGetPayload<{
  select: typeof utilisateurDeLaSessionSelect
}>

export type PrismaSessionUsupper = { readonly id: string } | null
