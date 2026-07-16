'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  CHOISIR_PROFIL_ERRORS,
  ChoisirProfilValidation,
} from '@app/web/features/inscription/abilities/choisir-profil'
import { choisirProfil } from '@app/web/features/inscription/abilities/choisir-profil/commands/choisir-profil'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const choisirProfilAction = actionBuilder()
  .use(withAuth())
  .use(withInput(ChoisirProfilValidation))
  .execute(
    fromResult(
      async ({ input, user }) =>
        choisirProfil(
          { userId: UserId(user.id), role: input.role },
          new Date(),
        ),
      { onError: CHOISIR_PROFIL_ERRORS },
    ),
  )
