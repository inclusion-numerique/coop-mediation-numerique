import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { enregistrerLaDerniereVisite } from '@/features/authentification/implementations/prisma/derniere-visite.mutation'
import { serializePrismaSessionUser } from '@/features/authentification/implementations/session/serialize-prisma-session-user.transfer'
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

const querySessionUser = async (sessionToken: string) =>
  prismaClient.session.findFirst({
    where: {
      sessionToken,
      expires: { gt: new Date() },
      user: {
        deleted: null,
      },
    },
    include: {
      usurper: {
        select: {
          id: true,
        },
      },
      user: {
        select: utilisateurDeLaSessionSelect,
      },
    },
  })

type PrismaSession = Exclude<Awaited<ReturnType<typeof querySessionUser>>, null>

export type UtilisateurDeLaSessionRow = PrismaSession['user']
export type PrismaSessionUsupper = PrismaSession['usurper']

export const utilisateurDuJetonDeSession = async (
  sessionToken: string | null,
): Promise<UtilisateurDeLaSession | null> => {
  if (!sessionToken) {
    return null
  }

  const res = await querySessionUser(sessionToken)

  if (!res?.user) {
    return null
  }

  enregistrerLaDerniereVisite({
    userId: res.user.id,
    currentLastSeen: res.user.lastSeen,
  })

  return serializePrismaSessionUser(res.user, res.usurper)
}

export const utilisateurDeLaSessionParId = async (
  userId: string,
): Promise<UtilisateurDeLaSession> => {
  const prismaSessionUser = await prismaClient.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: utilisateurDeLaSessionSelect,
  })

  return serializePrismaSessionUser(prismaSessionUser, null)
}
