import { prismaClient } from '@/configuration/prisma'
import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { enregistrerLaDerniereVisite } from '@/features/authentification/implementations/prisma/derniere-visite.mutation'
import { serializePrismaSessionUser } from '@/features/authentification/implementations/session/serialize-prisma-session-user.transfer'
import { utilisateurDeLaSessionSelect } from './utilisateur-de-la-session.select'

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
