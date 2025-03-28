import { prismaClient } from '@app/web/prismaClient'
import { generateRandomSecret } from '@app/web/security/generateRandomSecret'
import { hashSecret, verifySecret } from '@app/web/security/hashSecret'
import { ApiClient, ApiClientScope } from '@prisma/client'

export type CreateApiClientInput = {
  id?: string
  name: string
  scopes: ApiClientScope[]
  validUntil?: Date
  validFrom?: Date
}

export const createApiClient = async ({
  id,
  name,
  scopes,
  validFrom,
  validUntil,
}: CreateApiClientInput): Promise<
  ApiClient & {
    secret: string
  }
> => {
  const secret = generateRandomSecret()
  const secretHash = hashSecret(secret)

  const apiClient = await prismaClient.apiClient.create({
    data: {
      id,
      name,
      secretHash, // Store the hashed secret in the database
      validFrom: validFrom ?? new Date(),
      validUntil,
      scopes,
    },
  })

  return {
    ...apiClient,
    secret,
    secretHash,
  }
}

export type CreateApiClientOutput = Awaited<ReturnType<typeof createApiClient>>

export const rotateApiClientSecret = async ({
  clientId,
}: {
  clientId: string
}) => {
  const secret = generateRandomSecret()
  const secretHash = hashSecret(secret)

  await prismaClient.apiClient.update({
    where: { id: clientId },
    data: {
      secretHash, // Store the hashed secret in the database
      updated: new Date(),
    },
  })

  return {
    clientId,
    secret,
    secretHash,
  }
}

export const changeApiClientScopes = async ({
  clientId,
  scopes,
}: {
  clientId: string
  scopes: ApiClientScope[]
}) => {
  const apiClient = await prismaClient.apiClient.findUnique({
    where: { id: clientId },
  })

  if (!apiClient) {
    throw new Error('Api client not found')
  }

  await prismaClient.apiClient.update({
    where: { id: clientId },
    data: {
      scopes,
      updated: new Date(),
    },
  })
}

export const authenticateApiCient = async (
  clientId: string,
  clientSecret: string,
): Promise<ApiClient | null> => {
  // Ensure that clientId is a uuid v4 using regex
  if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/.test(clientId)) return null

  const apiClient = await prismaClient.apiClient.findUnique({
    where: { id: clientId },
  })

  if (!apiClient) return null

  const isValid = verifySecret(clientSecret, apiClient.secretHash)

  if (!isValid) return null

  const now = new Date()

  if (apiClient.validFrom > now) return null

  if (!!apiClient.validUntil && apiClient.validUntil < now) {
    return null
  }

  return apiClient
}
