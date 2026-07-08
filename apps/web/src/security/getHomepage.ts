import type { SessionUser } from '@app/web/auth/sessionUser'

type UserRedirectionInfo = Pick<SessionUser, 'role'> & {
  inscriptionValidee: Date | string | null
  mediateur: { id: string } | null
  coordinateur: { id: string } | null
}

/**
 * L’inscription n’est réellement complète que si un profil de rôle existe :
 * un compte « validé » sans médiateur ni coordinateur ne peut rien faire
 * dans la coop et doit reprendre son parcours d’inscription.
 */
export const hasInscriptionComplete = (
  user: Pick<
    UserRedirectionInfo,
    'inscriptionValidee' | 'mediateur' | 'coordinateur'
  >,
) =>
  user.inscriptionValidee != null &&
  (user.mediateur != null || user.coordinateur != null)

export const getHomepage = (user?: UserRedirectionInfo | null) => {
  if (!user) {
    return '/'
  }

  if (user.role === 'Admin') {
    return '/administration'
  }

  if (!hasInscriptionComplete(user)) {
    return '/inscription'
  }

  return '/coop'
}

export const getLoginRedirectUrl = (user?: UserRedirectionInfo | null) => {
  if (!user) {
    return '/connexion'
  }

  if (user.role === 'Admin' || user.role === 'Support') {
    return '/administration/utilisateurs'
  }

  if (!hasInscriptionComplete(user)) {
    return '/inscription'
  }

  return '/coop'
}
