import { NextRequest } from 'next/server'
import type {
  AuthentifierUnClientApi,
  IssueDAuthentification,
  PorteeApi,
} from '@/features/clients-api/domain'
import {
  apiV1AuthorizationHeader,
  apiV1AuthorizationScheme,
} from '@/libraries/json-api'

export const isAuthenticatedApiClientRequest =
  (authentifierUnClientApi: AuthentifierUnClientApi) =>
  async (
    request: NextRequest,
    scopes: PorteeApi[],
  ): Promise<IssueDAuthentification> => {
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
