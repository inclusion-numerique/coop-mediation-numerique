import { NextRequest } from 'next/server'
import { authentifierUnClientApi } from '@/features/clients-api/abilities/authentifier-un-client-api/implementations/prisma/authentifier-un-client-api.query'
import type {
  IssueDAuthentification,
  PorteeApi,
} from '@/features/clients-api/domain'
import {
  apiV1AuthorizationHeader,
  apiV1AuthorizationScheme,
} from '@/libraries/json-api/api-v1-headers'

export const isAuthenticatedApiClientRequest = async (
  request: NextRequest,
  scopes: PorteeApi[],
): Promise<IssueDAuthentification> => {
  // Get api key from header
  const authorizationString = request.headers.get(apiV1AuthorizationHeader)

  if (!authorizationString) {
    return 'NonAuthentifie'
  }

  const [scheme, value] = authorizationString.split(' ')

  if (scheme !== apiV1AuthorizationScheme) {
    return 'NonAuthentifie'
  }

  if (!value) {
    return 'NonAuthentifie'
  }

  const [clientId, clientSecret] = value.split(':')

  if (!clientId || !clientSecret) {
    return 'NonAuthentifie'
  }

  return authentifierUnClientApi({
    clientApiId: clientId,
    secret: clientSecret,
    portees: scopes,
  })
}
