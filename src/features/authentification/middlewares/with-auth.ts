import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user.query'
import type { PipeMiddleware, ServerActionResult } from '@/libraries/nextjs'
import { ServerActionError } from '@/libraries/nextjs'

export const withAuth =
  (): PipeMiddleware<object, { user: UtilisateurDeLaSession }, unknown> =>
  async (_ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    const user = await getSessionUser()
    if (!user) return ServerActionError('auth.unauthenticated')
    return next({ user })
  }
