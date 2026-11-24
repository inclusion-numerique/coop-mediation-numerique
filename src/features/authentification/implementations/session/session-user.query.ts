import { cookies } from 'next/headers'
import { cache } from 'react'
import 'server-only'
import { AuthenticationError } from '@/features/authentification/domain/errors'
import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import {
  secureSessionCookie,
  sessionCookie,
} from '@/features/authentification/implementations/session/session-token-from-cookies.query'

const getSessionToken = async (): Promise<string | null> => {
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

// User session is cached per request https://beta.nextjs.org/docs/data-fetching/caching#per-request-caching
const cachedGetSessionUserFromSessionToken = cache(utilisateurDuJetonDeSession)

export const getSessionUser =
  async (): Promise<UtilisateurDeLaSession | null> => {
    const sessionToken = await getSessionToken()

    if (!sessionToken) {
      return null
    }

    return cachedGetSessionUserFromSessionToken(sessionToken)
  }

export const getAuthenticatedSessionUser = () =>
  getSessionUser().then((user) => {
    if (!user) {
      throw new AuthenticationError('Unauthenticated user')
    }
    return user
  })
