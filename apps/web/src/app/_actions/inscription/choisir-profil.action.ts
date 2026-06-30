'use server'

import { withAuth } from '@app/web/features/authentification'
import { ChoisirProfilValidation } from '@app/web/features/inscription/abilities/choisir-profil'
import { choisirProfil } from '@app/web/features/inscription/abilities/choisir-profil/implementation'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const choisirProfilAction = actionBuilder()
  .use(withAuth())
  .use(withInput(ChoisirProfilValidation))
  .execute(async ({ input, user }) =>
    choisirProfil({ userId: UserId(user.id), profil: input.profil }),
  )
