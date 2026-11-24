import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import type { PipeMiddleware, ServerActionResult } from '@/libraries/nextjs'
import { ServerActionError } from '@/libraries/nextjs'

type MediateurContext = {
  mediateur: { id: string }
}

export const withMediateur =
  (): PipeMiddleware<
    { user: UtilisateurDeLaSession },
    MediateurContext,
    unknown
  > =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    if (!ctx.user.mediateur?.id) return ServerActionError('auth.not-mediateur')
    return next({ mediateur: { id: ctx.user.mediateur.id } })
  }
