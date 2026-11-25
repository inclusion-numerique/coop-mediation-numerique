'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RENOUVELER_LE_SECRET_ERRORS } from '@/features/clients-api/abilities/renouveler-le-secret/action/renouveler-le-secret.errors'
import { RenouvelerLeSecretValidation } from '@/features/clients-api/abilities/renouveler-le-secret/action/renouveler-le-secret.validation'
import { renouvelerLeSecret } from '@/features/clients-api/abilities/renouveler-le-secret/implementations/prisma/renouveler-le-secret.mutation'
import { nouveauSecret } from '@/features/clients-api/implementations/secret/secret.adapter'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const renouvelerLeSecretAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RenouvelerLeSecretValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await renouvelerLeSecret(nouveauSecret)({
          clientApiId: input.clientApiId,
        })
        return resultat.success
          ? success({ secret: resultat.data.secret })
          : resultat
      },
      { onError: RENOUVELER_LE_SECRET_ERRORS },
    ),
  )
