import { estActeurDeLaCoop } from '@/features/authentification/domain/acteur-de-la-coop'
import type { SessionUser } from '@/features/authentification/domain/sessionUser'
import type { PipeMiddleware, ServerActionResult } from '@/libraries/nextjs'
import { ServerActionError } from '@/libraries/nextjs'

export const withActeurDeLaCoop =
  (): PipeMiddleware<{ user: SessionUser }, { user: SessionUser }, unknown> =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> =>
    estActeurDeLaCoop(ctx.user)
      ? next({ user: ctx.user })
      : ServerActionError('auth.not-acteur-de-la-coop')
