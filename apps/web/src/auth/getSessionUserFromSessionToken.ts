import { serializePrismaSessionUser } from '@app/web/auth/serializePrismaSessionUser'
import type { SessionUser } from '@app/web/auth/sessionUser'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const sessionUserSelect = {
  id: true,
  email: true,
  phone: true,
  siret: true,
  firstName: true,
  lastName: true,
  name: true,
  emailVerified: true,
  image: true,
  title: true,
  location: true,
  description: true,
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
  featureFlags: true,
  timezone: true,
  isConseillerNumerique: true,
  emplois: {
    select: {
      id: true,
      structure: {
        select: {
          id: true,
          nom: true,
          codePostal: true,
          codeInsee: true,
          commune: true,
          modification: true,
        },
      },
    },
    where: {
      suppression: null,
      fin: null,
    },
    orderBy: {
      debut: 'desc',
    },
  },
  mediateur: {
    select: {
      id: true,
      isVisible: true,
      coordinations: {
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
        select: sessionUserSelect,
      },
    },
  })

export type PrismaSession = Exclude<
  Awaited<ReturnType<typeof querySessionUser>>,
  null
>

export type PrismaSessionUser = PrismaSession['user']
export type PrismaSessionUsupper = PrismaSession['usurper']

export const getSessionUserFromSessionToken = async (
  sessionToken: string | null,
): Promise<SessionUser | null> => {
  if (!sessionToken) {
    return null
  }

  const res = await querySessionUser(sessionToken)

  if (!res?.user) {
    return null
  }

  return serializePrismaSessionUser(res.user, res.usurper)
}

export const getSessionUserFromId = async (
  userId: string,
): Promise<SessionUser> => {
  const prismaSessionUser = await prismaClient.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: sessionUserSelect,
  })

  return serializePrismaSessionUser(prismaSessionUser, null)
}
