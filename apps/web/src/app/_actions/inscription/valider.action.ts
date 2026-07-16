'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  VALIDER_ERRORS,
  ValiderValidation,
} from '@app/web/features/inscription/abilities/valider'
import { validerInscription } from '@app/web/features/inscription/abilities/valider/commands/valider'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const validerAction = actionBuilder()
  .use(withAuth())
  .use(withInput(ValiderValidation))
  .execute(
    fromResult(
      async ({ user }) => validerInscription(UserId(user.id), new Date()),
      { onError: VALIDER_ERRORS },
    ),
  )
