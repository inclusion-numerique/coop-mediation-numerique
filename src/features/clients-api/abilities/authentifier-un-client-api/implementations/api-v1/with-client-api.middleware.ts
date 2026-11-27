import { type NextRequest, NextResponse } from 'next/server'
import { signaler } from '@/configuration/telemetry/serveur'
import {
  type AuthentifierLaRequete,
  isAuthenticatedApiClientRequest,
} from '@/features/clients-api/abilities/authentifier-un-client-api/implementations/api-v1/is-authenticated-api-client-request.middleware'
import type { PorteeApi } from '@/features/clients-api/domain'
import { apiV1AuthorizationScheme } from '@/libraries/json-api'
import { failure, type Result } from '@/libraries/result'
import type { ClientApiAuthentifie } from '../../domain/client-api-authentifie'
import {
  type EchecDAuthentifierUnClientApi,
  NonAuthentifie,
} from '../../domain/errors'

const issueDeLaRequete = (
  authentifier: AuthentifierLaRequete,
  request: NextRequest,
  portees: PorteeApi[],
): Promise<Result<ClientApiAuthentifie, EchecDAuthentifierUnClientApi>> =>
  isAuthenticatedApiClientRequest(authentifier)(request, portees).catch(
    (error: unknown) => {
      signaler(error)
      return failure(NonAuthentifie())
    },
  )

const REFUS: Record<EchecDAuthentifierUnClientApi['_tag'], () => NextResponse> =
  {
    NonAuthentifie: () =>
      NextResponse.json(
        { error: 'Unauthorized' },
        {
          status: 401,
          headers: { 'WWW-Authenticate': apiV1AuthorizationScheme },
        },
      ),
    NonAutorise: () =>
      NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
  }

export const withClientApi =
  (authentifier: AuthentifierLaRequete) =>
  (portees: PorteeApi[]) =>
  async (
    _ctx: object,
    request: NextRequest,
  ): Promise<{ ctx: object } | NextResponse> => {
    const issue = await issueDeLaRequete(authentifier, request, portees)
    return issue.success ? { ctx: {} } : REFUS[issue.error._tag]()
  }
