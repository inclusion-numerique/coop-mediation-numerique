import { isAuthenticatedApiClientRequest } from '@app/web/app/api/v1/isAuthenticatedApiClientRequest'
import { signaler } from '@app/web/configuration/telemetry/error-reporter/server/signaler'
import type { ApiClientScope } from '@app/web/generated/prisma/client'
import { type NextRequest, NextResponse } from 'next/server'

const estAuthentifie = (request: NextRequest, portees: ApiClientScope[]) =>
  isAuthenticatedApiClientRequest(request, portees).catch((error: unknown) => {
    signaler(error)
    return false
  })

export const withClientApi =
  (portees: ApiClientScope[]) =>
  async (
    _ctx: object,
    request: NextRequest,
  ): Promise<{ ctx: object } | NextResponse> =>
    (await estAuthentifie(request, portees))
      ? { ctx: {} }
      : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
