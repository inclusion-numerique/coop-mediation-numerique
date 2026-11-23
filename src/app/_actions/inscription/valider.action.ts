'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { VALIDER_ERRORS } from '@/features/inscription/abilities/valider/action/valider.errors'
import { ValiderValidation } from '@/features/inscription/abilities/valider/action/valider.validation'
import { validerInscription } from '@/features/inscription/abilities/valider/commands/valider'
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
        validerInscription(
          UserId(user.id),
          new Date(),
          inscrireALaListeDeDiffusion,
        ),
      { onError: VALIDER_ERRORS },
    ),
  )
