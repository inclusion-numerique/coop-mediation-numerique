import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import type { PipeMiddleware, ServerActionResult } from '@/libraries/nextjs'
import { ServerActionError } from '@/libraries/nextjs'

export const withAdmin =
  (): PipeMiddleware<
    { user: UtilisateurDeLaSession },
    { user: UtilisateurDeLaSession },
    unknown
  > =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    if (ctx.user.role !== 'Admin') return ServerActionError('auth.not-admin')
    return next({ user: ctx.user })
  }
