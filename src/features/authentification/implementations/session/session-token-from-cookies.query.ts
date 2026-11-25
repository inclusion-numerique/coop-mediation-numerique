import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'
import { cookies } from 'next/headers'
import { AuthenticationError } from '@/features/authentification/domain/errors'

export const secureSessionCookie = '__Secure-next-auth.session-token'
export const sessionCookie = 'next-auth.session-token'

export const jetonDeSessionDesCookies = (
  cookies: RequestCookies,
): string | null =>
  cookies.get(secureSessionCookie)?.value ??
  cookies.get(sessionCookie)?.value ??
  null

export const getSessionToken = async (): Promise<string | null> => {
  const allCookies = await cookies()
  const sessionToken =
    allCookies.get(secureSessionCookie) ?? allCookies.get(sessionCookie)

  if (!sessionToken) {
    return null
  }
  return sessionToken.value
}

export const getAuthenticatedSessionToken = async (): Promise<string> => {
  const token = await getSessionToken()
  if (!token) {
    throw new AuthenticationError('Unauthenticated user')
  }
  return token
}
