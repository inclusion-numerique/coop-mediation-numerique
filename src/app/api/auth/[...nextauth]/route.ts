import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { nextAuthOptions } from '@/features/authentification/implementation/next-auth/auth'
import { isFirewallUserAgent } from '@/features/authentification/implementation/next-auth/isFirewallUserAgent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const handler = (
  req: NextRequest,
  res: { params: Promise<{ nextauth: string[] }> },
) => {
  if (isFirewallUserAgent(req)) {
    return new Response('Bad Request', { status: 400 })
  }

  return NextAuth(req, res, nextAuthOptions)
}

export { handler as GET, handler as POST }
