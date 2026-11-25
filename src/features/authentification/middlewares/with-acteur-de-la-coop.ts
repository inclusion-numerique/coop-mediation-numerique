import { estActeurDeLaCoop } from '@/features/authentification/domain/acteur-de-la-coop'
import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import type { PipeMiddleware, ServerActionResult } from '@/libraries/nextjs'
import { ServerActionError } from '@/libraries/nextjs'

export const withActeurDeLaCoop =
  (): PipeMiddleware<
    { user: UtilisateurDeLaSession },
    { user: UtilisateurDeLaSession },
    unknown
  > =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> =>
    estActeurDeLaCoop(ctx.user)
      ? next({ user: ctx.user })
      : ServerActionError('auth.not-acteur-de-la-coop')
