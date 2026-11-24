import { type NextRequest, NextResponse } from 'next/server'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { isAuthenticatedApiClientRequest } from '@/features/clients-api/abilities/authentifier-un-client-api/implementations/api-v1/is-authenticated-api-client-request.middleware'
import type {
  IssueDAuthentification,
  PorteeApi,
} from '@/features/clients-api/domain'
import { apiV1AuthorizationScheme } from '@/libraries/json-api/api-v1-headers'

const issueDeLaRequete = (
  request: NextRequest,
  portees: PorteeApi[],
): Promise<IssueDAuthentification> =>
  isAuthenticatedApiClientRequest(request, portees).catch(
    (error: unknown): IssueDAuthentification => {
      signaler(error)
      return 'NonAuthentifie'
    },
  )

const REFUS: Record<
  Exclude<IssueDAuthentification, 'Authentifie'>,
  () => NextResponse
> = {
  NonAuthentifie: () =>
    NextResponse.json(
      { error: 'Unauthorized' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': apiV1AuthorizationScheme },
      },
    ),
  NonAutorise: () => NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
}

export const withClientApi =
  (portees: PorteeApi[]) =>
  async (
    _ctx: object,
    request: NextRequest,
  ): Promise<{ ctx: object } | NextResponse> => {
    const issue = await issueDeLaRequete(request, portees)
    return issue === 'Authentifie' ? { ctx: {} } : REFUS[issue]()
  }
