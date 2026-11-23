import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies'

export const secureSessionCookie = '__Secure-next-auth.session-token'
export const sessionCookie = 'next-auth.session-token'

export const getSessionTokenFromNextRequestCookies = (
  cookies: RequestCookies,
): string | null =>
  cookies.get(secureSessionCookie)?.value ??
  cookies.get(sessionCookie)?.value ??
  null
