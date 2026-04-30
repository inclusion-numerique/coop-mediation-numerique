import { getSessionUser } from '@app/web/auth/getSessionUser'
import type { SessionUser } from '@app/web/auth/sessionUser'
import type {
  PipeMiddleware,
  ServerActionResult,
} from '@app/web/libraries/nextjs'
import { ServerActionError } from '@app/web/libraries/nextjs'

export const withAuth =
  (): PipeMiddleware<object, { user: SessionUser }, unknown> =>
  async (_ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    const user = await getSessionUser()
    if (!user) return ServerActionError('auth.unauthenticated')
    return next({ user })
  }
