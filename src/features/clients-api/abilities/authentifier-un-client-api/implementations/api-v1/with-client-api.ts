import { type NextRequest, NextResponse } from 'next/server'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { isAuthenticatedApiClientRequest } from '@/features/clients-api/abilities/authentifier-un-client-api/implementations/api-v1/is-authenticated-api-client-request'
import type { PorteeApi } from '@/features/clients-api/domain'

const estAuthentifie = (request: NextRequest, portees: PorteeApi[]) =>
  isAuthenticatedApiClientRequest(request, portees).catch((error: unknown) => {
    signaler(error)
    return false
  })

export const withClientApi =
  (portees: PorteeApi[]) =>
  async (
    _ctx: object,
    request: NextRequest,
  ): Promise<{ ctx: object } | NextResponse> =>
    (await estAuthentifie(request, portees))
      ? { ctx: {} }
      : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
