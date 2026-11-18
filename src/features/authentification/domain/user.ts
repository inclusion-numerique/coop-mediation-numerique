import { SessionUser } from '@/features/authentification/domain/sessionUser'

export type UserDisplayName = Pick<
  SessionUser,
  'firstName' | 'lastName' | 'email' | 'name'
>

export type UserId = Pick<SessionUser, 'id'>

export type UserRdvAccount = Pick<SessionUser, 'rdvAccount'>

export type UserTimezone = Pick<SessionUser, 'timezone'>

export const getUserDisplayName = (user: UserDisplayName): string => {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  if (name) return name
  if (user.name) return user.name
  return user.email
}
