import { cache } from 'react'
import 'server-only'
import { AuthenticationError } from '@/features/authentification/domain/errors'
import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { getSessionToken } from '@/features/authentification/implementations/session/session-token-from-cookies.query'

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
