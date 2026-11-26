import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'

type UserRedirectionInfo = Pick<UtilisateurDeLaSession, 'role'> & {
  inscriptionValidee: Date | string | null
  mediateur: { id: string } | null
  coordinateur: { id: string } | null
}

export const aTermineSonInscription = (
  user: Pick<
    UserRedirectionInfo,
    'inscriptionValidee' | 'mediateur' | 'coordinateur'
  >,
) =>
  user.inscriptionValidee != null &&
  (user.mediateur != null || user.coordinateur != null)

export const pageDAccueil = (user?: UserRedirectionInfo | null) => {
  if (!user) {
    return '/'
  }

  if (user.role === 'Admin') {
    return '/administration'
  }

  if (!aTermineSonInscription(user)) {
    return '/inscription'
  }

  return '/coop'
}

export const adresseDeRetourApresConnexion = (
  user?: UserRedirectionInfo | null,
) => {
  if (!user) {
    return '/connexion'
  }

  if (user.role === 'Admin') {
    return '/administration/utilisateurs'
  }

  if (!aTermineSonInscription(user)) {
    return '/inscription'
  }

  return '/coop'
}
