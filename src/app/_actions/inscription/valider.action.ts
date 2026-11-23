'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { VALIDER_ERRORS } from '@/features/inscription/abilities/valider/action/valider.errors'
import { ValiderValidation } from '@/features/inscription/abilities/valider/action/valider.validation'
import { validerAvec } from '@/features/inscription/abilities/valider/implementations/valider.binding'
import { UserId } from '@/features/inscription/domain'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { inscrireALaListeDeDiffusion } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/brevo/inscrire-a-la-liste-de-diffusion'
import { fromResult, withInput } from '@/libraries/nextjs'

export const validerAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ValiderValidation))
  .execute(
    fromResult(
      async ({ user }) =>
        validerAvec(inscrireALaListeDeDiffusion)(UserId(user.id), new Date()),
      { onError: VALIDER_ERRORS },
    ),
  )
