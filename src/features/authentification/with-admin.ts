import type { SessionUser } from '@app/web/auth/sessionUser'
import type {
  PipeMiddleware,
  ServerActionResult,
} from '@app/web/libraries/nextjs'
import { ServerActionError } from '@app/web/libraries/nextjs'

export const withAdmin =
  (): PipeMiddleware<{ user: SessionUser }, { user: SessionUser }, unknown> =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    if (ctx.user.role !== 'Admin') return ServerActionError('auth.not-admin')
    // Le contexte est REPROPAGÉ : un `Record<string, never>` absorbe tout au
    // merge du builder, et rendait `user` inatteignable après cette garde.
    return next({ user: ctx.user })
  }
