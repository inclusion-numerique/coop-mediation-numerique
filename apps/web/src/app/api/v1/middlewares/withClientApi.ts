import { isAuthenticatedApiClientRequest } from '@app/web/app/api/v1/isAuthenticatedApiClientRequest'
import type { ApiClientScope } from '@app/web/generated/prisma/client'
import * as Sentry from '@sentry/nextjs'
import { type NextRequest, NextResponse } from 'next/server'

const estAuthentifie = (request: NextRequest, portees: ApiClientScope[]) =>
  isAuthenticatedApiClientRequest(request, portees).catch((error: unknown) => {
    Sentry.captureException(error)
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
