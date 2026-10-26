'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { creerUnClientApi } from '@app/web/features/clients-api/abilities/creer-un-client-api'
import { CREER_UN_CLIENT_API_ERRORS } from '@app/web/features/clients-api/abilities/creer-un-client-api/action/creer-un-client-api.errors'
import {
  ClientApiValidation,
  definitionDepuis,
} from '@app/web/features/clients-api/formulaire'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'

export const creerUnClientApiAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ClientApiValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await creerUnClientApi(definitionDepuis(input))
        return resultat.success
          ? success({ clientApiId: resultat.data.client.id })
          : resultat
      },
      { onError: CREER_UN_CLIENT_API_ERRORS },
    ),
  )
