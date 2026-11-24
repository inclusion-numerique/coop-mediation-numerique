import { prismaClient } from '@/configuration/prisma/prisma-client'

const computeExpiresAt = (expiresIn?: number): number | undefined => {
  if (expiresIn === undefined) return undefined
  // If provider gave a timestamp in milliseconds
  if (expiresIn > 1_000_000_000_000) return Math.floor(expiresIn / 1000)
  // If provider gave an absolute epoch seconds timestamp
  if (expiresIn > 1_000_000_000) return Math.floor(expiresIn)
  // Otherwise it's a delta in seconds
  return Math.floor(Date.now() / 1000) + expiresIn
}

export const updateAccountTokens = async ({
  userId,
  provider,
  tokens,
}: {
  userId: string
  provider: string
  tokens: {
    access_token?: string | undefined
    refresh_token?: string | undefined
    expires_in?: number | undefined
    id_token?: string | undefined
    scope?: string | undefined
  }
}) => {
  const expiresAt = computeExpiresAt(tokens.expires_in)

  await prismaClient.account.updateMany({
    where: {
      userId,
      provider,
    },
    data: {
      ...(tokens.access_token === undefined
        ? {}
        : { access_token: tokens.access_token }),
      ...(tokens.refresh_token === undefined
        ? {}
        : { refresh_token: tokens.refresh_token }),
      ...(expiresAt === undefined ? {} : { expires_at: expiresAt }),
      ...(tokens.id_token === undefined ? {} : { id_token: tokens.id_token }),
      ...(tokens.scope === undefined ? {} : { scope: tokens.scope }),
    },
  })
}
