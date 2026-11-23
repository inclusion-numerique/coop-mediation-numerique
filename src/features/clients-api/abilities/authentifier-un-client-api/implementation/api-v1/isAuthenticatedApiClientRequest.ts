import { NextRequest } from 'next/server'
import { authentifierUnClientApi } from '@/features/clients-api/abilities/authentifier-un-client-api'
import { ApiClientScope } from '@/generated/prisma/browser'
import {
  apiV1AuthorizationHeader,
  apiV1AuthorizationScheme,
} from '@/libraries/json-api/apiV1Headers'

export const isAuthenticatedApiClientRequest = async (
  request: NextRequest,
  scopes: ApiClientScope[],
) => {
  // Get api key from header
  const authorizationString = request.headers.get(apiV1AuthorizationHeader)

  if (!authorizationString) {
    return false
  }

  const [scheme, value] = authorizationString.split(' ')

  if (scheme !== apiV1AuthorizationScheme) {
    return false
  }

  if (!value) {
    return false
  }

  const [clientId, clientSecret] = value.split(':')

  if (!clientId || !clientSecret) {
    return false
  }

  return authentifierUnClientApi({
    clientApiId: clientId,
    secret: clientSecret,
    portees: scopes,
  })
}
