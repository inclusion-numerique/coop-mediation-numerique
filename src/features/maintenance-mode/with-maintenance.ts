import type {
  PipeMiddleware,
  ServerActionResult,
} from '@app/web/libraries/nextjs'
import { ServerActionError } from '@app/web/libraries/nextjs'
import { consulterLaMaintenance } from './abilities/consulter-la-maintenance'
import {
  messageAffiche,
  peutModifierPendantLaMaintenance,
  type RoleDuCompte,
} from './domain'

export const withMaintenance =
  (): PipeMiddleware<
    { user: { readonly role: RoleDuCompte } },
    object,
    unknown
  > =>
  async (ctx, _rawInput, next): Promise<ServerActionResult<unknown>> => {
    const etat = await consulterLaMaintenance()
    if (!peutModifierPendantLaMaintenance({ role: ctx.user.role, etat }))
      return ServerActionError(messageAffiche(etat))
    return next({})
  }
