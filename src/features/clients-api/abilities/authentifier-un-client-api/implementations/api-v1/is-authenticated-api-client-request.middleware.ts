import { NextRequest } from 'next/server'
import { ClientApiId, type PorteeApi } from '@/features/clients-api/domain'
import {
  apiV1AuthorizationHeader,
  apiV1AuthorizationScheme,
} from '@/libraries/json-api'
import { failure, type Result } from '@/libraries/result'
import type { authentifierUnClientApi } from '../../domain/authentifier-un-client-api'
import type { ClientApiAuthentifie } from '../../domain/client-api-authentifie'
import {
  type EchecDAuthentifierUnClientApi,
  NonAuthentifie,
} from '../../domain/errors'

export type AuthentifierLaRequete = ReturnType<typeof authentifierUnClientApi>

export const isAuthenticatedApiClientRequest =
  (authentifier: AuthentifierLaRequete) =>
  async (
    request: NextRequest,
    scopes: PorteeApi[],
  ): Promise<Result<ClientApiAuthentifie, EchecDAuthentifierUnClientApi>> => {
    const authorizationString = request.headers.get(apiV1AuthorizationHeader)

    if (!authorizationString) {
      return failure(NonAuthentifie())
    }

    const [scheme, value] = authorizationString.split(' ')

    if (scheme !== apiV1AuthorizationScheme) {
      return failure(NonAuthentifie())
    }

    if (!value) {
      return failure(NonAuthentifie())
    }

    const [clientId, clientSecret] = value.split(':')

    if (!clientId || !clientSecret) {
      return failure(NonAuthentifie())
    }

    return authentifier({
      clientApiId: ClientApiId.safe(clientId),
      secret: clientSecret,
      portees: scopes,
      maintenant: new Date(),
    })
  }
