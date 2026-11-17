'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import { creerUnClientApi } from '@/features/clients-api/abilities/creer-un-client-api'
import { CREER_UN_CLIENT_API_ERRORS } from '@/features/clients-api/abilities/creer-un-client-api/action/creer-un-client-api.errors'
import {
  ClientApiValidation,
  definitionDepuis,
} from '@/features/clients-api/formulaire'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

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
