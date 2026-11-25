import { type NextRequest, NextResponse } from 'next/server'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'

export const withAdminRoute = async (
  _ctx: object,
  request: NextRequest,
): Promise<{ ctx: object } | NextResponse> => {
  const user = await utilisateurDuJetonDeSession(
    jetonDeSessionDesCookies(request.cookies),
  )

  return user?.role === 'Admin'
    ? { ctx: {} }
    : new NextResponse('Unauthorized', { status: 401 })
}
