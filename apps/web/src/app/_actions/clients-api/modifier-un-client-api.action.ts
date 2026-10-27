'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { modifierUnClientApi } from '@app/web/features/clients-api/abilities/modifier-un-client-api'
import { MODIFIER_UN_CLIENT_API_ERRORS } from '@app/web/features/clients-api/abilities/modifier-un-client-api/action/modifier-un-client-api.errors'
import { ModifierUnClientApiValidation } from '@app/web/features/clients-api/abilities/modifier-un-client-api/action/modifier-un-client-api.validation'
import { definitionDepuis } from '@app/web/features/clients-api/formulaire'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'

export const modifierUnClientApiAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ModifierUnClientApiValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await modifierUnClientApi({
          clientApiId: input.clientApiId,
          definition: definitionDepuis(input),
        })
        return resultat.success
          ? success({ clientApiId: resultat.data.id })
          : resultat
      },
      { onError: MODIFIER_UN_CLIENT_API_ERRORS },
    ),
  )
