import type { SessionUser } from '@app/web/auth/sessionUser'
import { prismaClient } from '@app/web/prismaClient'
import { invalidError } from '@app/web/server/rpc/trpcErrors'

export const getUserContextForOAuthApiCall = async ({
  user,
}: {
  user: Pick<SessionUser, 'id' | 'rdvAccount'>
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

  if (!rdvAccount || !user.rdvAccount?.hasOauthTokens) {
    throw invalidError('Compte RDV Service Public non connecté')
  }

  return { ...userWithSecretData, rdvAccount }
}
