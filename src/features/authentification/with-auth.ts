import { getSessionUser } from '@/auth/getSessionUser'
import type { SessionUser } from '@/auth/sessionUser'
import type { PipeMiddleware, ServerActionResult } from '@/libraries/nextjs'
import { ServerActionError } from '@/libraries/nextjs'

export const withAuth =
  (): PipeMiddleware<object, { user: SessionUser }, unknown> =>
  async (_ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    const user = await getSessionUser()
    if (!user) return ServerActionError('auth.unauthenticated')
    return next({ user })
  }
