import { type NextRequest, NextResponse } from 'next/server'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/session-token-from-cookies'

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
