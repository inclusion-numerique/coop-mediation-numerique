'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { renouvelerLeSecret } from '@app/web/features/clients-api/abilities/renouveler-le-secret'
import { RENOUVELER_LE_SECRET_ERRORS } from '@app/web/features/clients-api/abilities/renouveler-le-secret/action/renouveler-le-secret.errors'
import { RenouvelerLeSecretValidation } from '@app/web/features/clients-api/abilities/renouveler-le-secret/action/renouveler-le-secret.validation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'

export const renouvelerLeSecretAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RenouvelerLeSecretValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await renouvelerLeSecret({
          clientApiId: input.clientApiId,
        })
        return resultat.success
          ? success({ secret: resultat.data.secret })
          : resultat
      },
      { onError: RENOUVELER_LE_SECRET_ERRORS },
    ),
  )
