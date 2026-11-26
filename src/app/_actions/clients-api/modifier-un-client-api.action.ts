'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { MODIFIER_UN_CLIENT_API_ERRORS } from '@/features/clients-api/abilities/modifier-un-client-api/action/modifier-un-client-api.errors'
import { ModifierUnClientApiValidation } from '@/features/clients-api/abilities/modifier-un-client-api/action/modifier-un-client-api.validation'
import { modifierUnClientApi } from '@/features/clients-api/abilities/modifier-un-client-api/domain/modifier-un-client-api'
import { enregistrerLaModification } from '@/features/clients-api/abilities/modifier-un-client-api/implementations/prisma/enregistrer-la-modification.mutation'
import { definitionDepuis } from '@/features/clients-api/action/client-api.validation'
import { clientApiExiste } from '@/features/clients-api/implementations/prisma/client-api-existe.query'
import { nomDejaPris } from '@/features/clients-api/implementations/prisma/nom-deja-pris.query'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const modifierUnClientApiAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(ModifierUnClientApiValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await modifierUnClientApi({
          clientApiExiste,
          leNomEstPris: nomDejaPris,
          enregistrer: enregistrerLaModification,
        })({
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
