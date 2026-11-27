import { prismaClient } from '@/configuration/prisma'

const estUnInstantEnMillisecondes = (expiresIn: number): boolean =>
  expiresIn > 1_000_000_000_000

const estUnInstantEnSecondes = (expiresIn: number): boolean =>
  expiresIn > 1_000_000_000

const dansSecondes = (delaiEnSecondes: number): number =>
  Math.floor(Date.now() / 1000) + delaiEnSecondes

const computeExpiresAt = (expiresIn?: number): number | undefined => {
  if (expiresIn === undefined) return undefined
  if (estUnInstantEnMillisecondes(expiresIn))
    return Math.floor(expiresIn / 1000)
  if (estUnInstantEnSecondes(expiresIn)) return Math.floor(expiresIn)
  return dansSecondes(expiresIn)
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
