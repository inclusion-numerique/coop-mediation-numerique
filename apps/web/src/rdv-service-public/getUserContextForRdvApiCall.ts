import type { SessionUser } from '@app/web/auth/sessionUser'
import { prismaClient } from '@app/web/prismaClient'
import { invalidError } from '@app/web/server/rpc/trpcErrors'

export const getUserContextForOAuthApiCall = async ({
  user,
}: {
  user: Pick<SessionUser, 'id'>
}) => {
  const userWithSecretData = await prismaClient.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      rdvAccount: {
        include: {
          organisations: true,
        },
      },
    },
  })

  if (!userWithSecretData) {
    throw invalidError('Utilisateur introuvable')
  }

  const { rdvAccount } = userWithSecretData

  if (!rdvAccount) {
    throw invalidError('Compte RDV Service Public non connecté')
  }

  return { ...userWithSecretData, rdvAccount }
}

export type UserContextForRdvApiCall = Awaited<
  ReturnType<typeof getUserContextForOAuthApiCall>
>
