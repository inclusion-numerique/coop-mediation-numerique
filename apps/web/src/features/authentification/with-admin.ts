import type { SessionUser } from '@app/web/auth/sessionUser'
import type {
  PipeMiddleware,
  ServerActionResult,
} from '@app/web/libraries/nextjs'
import { ServerActionError } from '@app/web/libraries/nextjs'

export const withAdmin =
  (): PipeMiddleware<{ user: SessionUser }, Record<string, never>, unknown> =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    if (ctx.user.role !== 'Admin') return ServerActionError('auth.not-admin')
    return next({})
  }
