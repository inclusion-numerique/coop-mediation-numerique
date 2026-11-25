'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { CREER_UN_CLIENT_API_ERRORS } from '@/features/clients-api/abilities/creer-un-client-api/action/creer-un-client-api.errors'
import { creerUnClientApi } from '@/features/clients-api/abilities/creer-un-client-api/implementations/prisma/creer-un-client-api.mutation'
import {
  ClientApiValidation,
  definitionDepuis,
} from '@/features/clients-api/action/client-api.validation'
import { nouveauSecret } from '@/features/clients-api/implementations/secret/secret.adapter'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const creerUnClientApiAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ClientApiValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await creerUnClientApi(nouveauSecret)(
          definitionDepuis(input),
        )
        return resultat.success
          ? success({ clientApiId: resultat.data.client.id })
          : resultat
      },
      { onError: CREER_UN_CLIENT_API_ERRORS },
    ),
  )
