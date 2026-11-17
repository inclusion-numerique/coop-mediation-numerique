import { type NextRequest, NextResponse } from 'next/server'
import { isAuthenticatedApiClientRequest } from '@/app/api/v1/isAuthenticatedApiClientRequest'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import type { ApiClientScope } from '@/generated/prisma/client'

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
