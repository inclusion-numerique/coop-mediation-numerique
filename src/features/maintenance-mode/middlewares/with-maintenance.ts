import type { PipeMiddleware, ServerActionResult } from '@/libraries/nextjs'
import { ServerActionError } from '@/libraries/nextjs'
import {
  messageAffiche,
  peutModifierPendantLaMaintenance,
  type RoleDuCompte,
} from '../domain'
import { consulterLaMaintenance } from '../implementations/prisma/etat-de-maintenance.query'

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
