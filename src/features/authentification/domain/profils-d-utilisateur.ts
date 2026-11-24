import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'

export type UtilisateurMediateur<
  T extends Pick<UtilisateurDeLaSession, 'mediateur'> = UtilisateurDeLaSession,
> = T & {
  mediateur: Exclude<T['mediateur'], null>
}

export type UtilisateurCoordinateur<
  T extends Pick<
    UtilisateurDeLaSession,
    'coordinateur'
  > = UtilisateurDeLaSession,
> = T & {
  coordinateur: Exclude<T['coordinateur'], null>
}

export type UtilisateurConseillerNumerique<
  T extends Pick<
    UtilisateurDeLaSession,
    'isConseillerNumerique'
  > = UtilisateurDeLaSession,
> = T & {
  isConseillerNumerique: true
}

export const estMediateur = <
  T extends Pick<
    UtilisateurDeLaSession,
    'mediateur' | 'emplois'
  > = UtilisateurDeLaSession,
>(
  user: T,
): user is UtilisateurMediateur<T> => !!user.mediateur

export const estConseillerNumerique = <
  T extends Pick<
    UtilisateurDeLaSession,
    'isConseillerNumerique'
  > = UtilisateurDeLaSession,
>(
  user: T | null,
): user is UtilisateurConseillerNumerique<T> => !!user?.isConseillerNumerique

export const estCoordinateur = <
  T extends Pick<
    UtilisateurDeLaSession,
    'coordinateur' | 'emplois'
  > = UtilisateurDeLaSession,
>(
  user: T,
): user is UtilisateurCoordinateur<T> => !!user.coordinateur
