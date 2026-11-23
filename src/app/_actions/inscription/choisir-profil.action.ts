'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import {
  CHOISIR_PROFIL_ERRORS,
  ChoisirProfilValidation,
} from '@/features/inscription/abilities/choisir-profil'
import { choisirProfil } from '@/features/inscription/abilities/choisir-profil/commands/choisir-profil'
import { UserId } from '@/features/inscription/domain'
import { withMaintenance } from '@/features/maintenance-mode'
import { synchroniserPersonne } from '@/features/registre-des-personnes'
import { fromResult, withInput } from '@/libraries/nextjs'

export const choisirProfilAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ChoisirProfilValidation))
  .execute(
    fromResult(
      async ({ input, user }) =>
        choisirProfil(
          { userId: UserId(user.id), role: input.role },
          new Date(),
          synchroniserPersonne,
        ),
      { onError: CHOISIR_PROFIL_ERRORS },
    ),
  )
