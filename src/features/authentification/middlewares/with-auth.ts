import type { SessionUser } from '@/features/authentification/domain/utilisateur-de-la-session'
import { getSessionUser } from '@/features/authentification/implementations/session/getSessionUser'
import type { PipeMiddleware, ServerActionResult } from '@/libraries/nextjs'
import { ServerActionError } from '@/libraries/nextjs'

export const withAuth =
  (): PipeMiddleware<object, { user: SessionUser }, unknown> =>
  async (_ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    const user = await getSessionUser()
    if (!user) return ServerActionError('auth.unauthenticated')
    return next({ user })
  }
