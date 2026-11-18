'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import {
  VALIDER_ERRORS,
  ValiderValidation,
} from '@/features/inscription/abilities/valider'
import { validerInscription } from '@/features/inscription/abilities/valider/commands/valider'
import { UserId } from '@/features/inscription/domain'
import { withMaintenance } from '@/features/maintenance-mode'
import { fromResult, withInput } from '@/libraries/nextjs'

export const validerAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ValiderValidation))
  .execute(
    fromResult(
      async ({ user }) => validerInscription(UserId(user.id), new Date()),
      { onError: VALIDER_ERRORS },
    ),
  )
