import type { SessionUser } from '@app/web/auth/sessionUser'

export type MediateurUser<
  T extends Pick<SessionUser, 'mediateur'> = SessionUser,
> = T & {
  mediateur: Exclude<T['mediateur'], null>
}

export type CoordinateurUser<
  T extends Pick<SessionUser, 'coordinateur'> = SessionUser,
> = T & {
  coordinateur: Exclude<T['coordinateur'], null>
}

export type ConseillerNumeriqueUser<
  T extends Pick<SessionUser, 'isConseillerNumerique'> = SessionUser,
> = T & {
  isConseillerNumerique: true
}

export const isMediateur = <
  T extends Pick<SessionUser, 'mediateur' | 'emplois'> = SessionUser,
>(
  user: T,
): user is MediateurUser<T> => !!user.mediateur

export const isConseillerNumerique = <
  T extends Pick<SessionUser, 'isConseillerNumerique'> = SessionUser,
>(
  user: T | null,
): user is ConseillerNumeriqueUser<T> => !!user?.isConseillerNumerique

export const isCoordinateur = <
  T extends Pick<SessionUser, 'coordinateur' | 'emplois'> = SessionUser,
>(
  user: T,
): user is CoordinateurUser<T> => !!user.coordinateur

export const isCoordinateurConseillerNumerique = <
  T extends Pick<
    SessionUser,
    'coordinateur' | 'isConseillerNumerique'
  > = SessionUser,
>(
  user: T,
): user is CoordinateurUser<T> & ConseillerNumeriqueUser<T> =>
  !!user.coordinateur && !!user.isConseillerNumerique
