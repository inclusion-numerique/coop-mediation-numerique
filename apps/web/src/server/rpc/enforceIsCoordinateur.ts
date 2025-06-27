import { SessionUser } from '@app/web/auth/sessionUser'
import { forbiddenError } from '@app/web/server/rpc/trpcErrors'

// assertion functions cannot be arrow functions
export function enforceIsCoordinateur<
  T extends Pick<SessionUser, 'role' | 'coordinateur'> | null,
>(
  user: T,
): asserts user is Exclude<T, null> & {
  role: 'User'
  coordinateur: Exclude<Exclude<T, null>['coordinateur'], null>
} {
  if (user?.role !== 'User') {
    throw forbiddenError()
  }

  if (!user?.coordinateur?.id) {
    throw forbiddenError()
  }
}
