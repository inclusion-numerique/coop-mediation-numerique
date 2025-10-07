import { SessionUser } from '@app/web/auth/sessionUser'

export type UserProfile = Partial<
  Pick<SessionUser, 'mediateur' | 'coordinateur' | 'emplois' | 'role'>
>

export type UserDisplayName = Pick<
  SessionUser,
  'firstName' | 'lastName' | 'email' | 'name'
>

export type UserId = Pick<SessionUser, 'id'>

export type UserRdvAccount = Pick<SessionUser, 'rdvAccount'>

export type UserTimezone = Pick<SessionUser, 'timezone'>

export type UserFeatureFlags = Pick<SessionUser, 'featureFlags'>

export type UserWithRole = Pick<SessionUser, 'role'>

export type UserMediateur = Pick<SessionUser, 'mediateur'>

export type UserCoordinateur = Pick<SessionUser, 'coordinateur'>

export const getUserDisplayName = (user: UserDisplayName): string => {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  if (name) return name
  if (user.name) return user.name
  return user.email
}
