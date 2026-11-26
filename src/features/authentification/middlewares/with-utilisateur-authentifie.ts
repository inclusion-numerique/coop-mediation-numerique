import type { Route } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  estCoordinateur,
  estMediateur,
  type UtilisateurCoordinateur,
  type UtilisateurMediateur,
} from '@/features/authentification/domain/profils-d-utilisateur'
import { AuthenticationError } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import {
  getAuthenticatedSessionUser,
  getSessionUser,
} from '@/features/authentification/middlewares/with-utilisateur-de-la-session'

/**
 * This gets the session user from request cache and redirects to login
 * with correct callback url if user is not found
 *
 * This should be called in Layout and Page components and be the first
 * call in those components for better readability of authentication logic.
 */
export const authenticateUser = async (redirectTo: Route = '/connexion') => {
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
  redirectTo: Route = '/connexion',
): Promise<UtilisateurMediateur> => {
  const user = await authenticateUser(redirectTo)
  if (estMediateur(user)) return user
  redirect(redirectTo)
}

export const authenticateCoordinateur = async (
  redirectTo: Route = '/connexion',
): Promise<UtilisateurCoordinateur> => {
  const user = await authenticateUser(redirectTo)
  if (estCoordinateur(user)) return user
  redirect(redirectTo)
}

export const authenticateMediateurOrCoordinateur = async (
  redirectTo: Route = '/connexion',
): Promise<UtilisateurMediateur | UtilisateurCoordinateur> => {
  const user = await authenticateUser(redirectTo)
  if (estMediateur(user) || estCoordinateur(user)) return user

  redirect(redirectTo)
}

export const authenticateAdmin = async () => {
  const user = await getSessionUser()
  if (user?.role !== 'Admin') notFound()
  return user
}
