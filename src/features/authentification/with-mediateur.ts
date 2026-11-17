import type { SessionUser } from '@app/web/auth/sessionUser'
import type {
  PipeMiddleware,
  ServerActionResult,
} from '@app/web/libraries/nextjs'
import { ServerActionError } from '@app/web/libraries/nextjs'

type MediateurContext = {
  mediateur: { id: string }
}

export const withMediateur =
  (): PipeMiddleware<{ user: SessionUser }, MediateurContext, unknown> =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    if (!ctx.user.mediateur?.id) return ServerActionError('auth.not-mediateur')
    return next({ mediateur: { id: ctx.user.mediateur.id } })
  }
