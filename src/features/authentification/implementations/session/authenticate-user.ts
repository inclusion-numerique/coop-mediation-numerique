import { notFound, redirect } from 'next/navigation'
import { AuthenticationError } from '@/features/authentification/domain/errors'
import {
  type CoordinateurUser,
  isCoordinateur,
  isMediateur,
  type MediateurUser,
} from '@/features/authentification/domain/profils-d-utilisateur'
import {
  getAuthenticatedSessionUser,
  getSessionUser,
} from '@/features/authentification/implementations/session/session-user'

/**
 * This gets the session user from request cache and redirects to login
 * with correct callback url if user is not found
 *
 * This should be called in Layout and Page components and be the first
 * call in those components for better readability of authentication logic.
 */
export const authenticateUser = async (redirectTo = '/connexion') => {
  try {
    return await getAuthenticatedSessionUser()
  } catch (error) {
    if (!(error instanceof AuthenticationError)) {
      throw error
    }

    redirect(redirectTo)
  }
}

export const authenticateMediateur = async (
  redirectTo = '/connexion',
): Promise<MediateurUser> => {
  const user = await authenticateUser(redirectTo)
  if (isMediateur(user)) return user
  redirect(redirectTo)
}

export const authenticateCoordinateur = async (
  redirectTo = '/connexion',
): Promise<CoordinateurUser> => {
  const user = await authenticateUser(redirectTo)
  if (isCoordinateur(user)) return user
  redirect(redirectTo)
}

export const authenticateMediateurOrCoordinateur = async (
  redirectTo = '/connexion',
): Promise<MediateurUser | CoordinateurUser> => {
  const user = await authenticateUser(redirectTo)
  if (isMediateur(user) || isCoordinateur(user)) return user

  redirect(redirectTo)
}

export const authenticateAdmin = async () => {
  const user = await getSessionUser()
  if (user?.role !== 'Admin') notFound()
  return user
}
