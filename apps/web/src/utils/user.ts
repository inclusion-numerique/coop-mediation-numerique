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
export type UserWithExistingRdvAccount = UserRdvAccount & {
  rdvAccount: Exclude<UserRdvAccount['rdvAccount'], null>
}

export type UserMediateur = Pick<SessionUser, 'mediateur'>
export type UserWithExistingMediateur = UserMediateur & {
  mediateur: Exclude<UserMediateur['mediateur'], null>
}

export type UserCoordinateur = Pick<SessionUser, 'coordinateur'>

export type UserTimezone = Pick<SessionUser, 'timezone'>

export type UserFeatureFlags = Pick<SessionUser, 'featureFlags'>

export type UserWithRole = Pick<SessionUser, 'role'>

export const getUserDisplayName = (user: UserDisplayName): string => {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  if (name) return name
  if (user.name) return user.name
  return user.email
}
