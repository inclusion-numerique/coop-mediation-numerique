import { type NextRequest, NextResponse } from 'next/server'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementations/session/getSessionUserFromSessionToken'

export const withAdminRoute = async (
  _ctx: object,
  request: NextRequest,
): Promise<{ ctx: object } | NextResponse> => {
  const user = await getSessionUserFromSessionToken(
    getSessionTokenFromNextRequestCookies(request.cookies),
  )

  return user?.role === 'Admin'
    ? { ctx: {} }
    : new NextResponse('Unauthorized', { status: 401 })
}
