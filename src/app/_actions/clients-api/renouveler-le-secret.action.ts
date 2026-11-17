'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import { renouvelerLeSecret } from '@/features/clients-api/abilities/renouveler-le-secret'
import { RENOUVELER_LE_SECRET_ERRORS } from '@/features/clients-api/abilities/renouveler-le-secret/action/renouveler-le-secret.errors'
import { RenouvelerLeSecretValidation } from '@/features/clients-api/abilities/renouveler-le-secret/action/renouveler-le-secret.validation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

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
