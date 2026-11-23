'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { CHOISIR_PROFIL_ERRORS } from '@/features/inscription/abilities/choisir-profil/action/choisir-profil.errors'
import { ChoisirProfilValidation } from '@/features/inscription/abilities/choisir-profil/action/choisir-profil.validation'
import { choisirProfilAvec } from '@/features/inscription/abilities/choisir-profil/implementations/choisir-profil.binding'
import { UserId } from '@/features/inscription/domain'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'

export const choisirProfilAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ChoisirProfilValidation))
  .execute(
    fromResult(
      async ({ input, user }) =>
        choisirProfilAvec(synchroniserPersonne)(
          { userId: UserId(user.id), role: input.role },
          new Date(),
        ),
      { onError: CHOISIR_PROFIL_ERRORS },
    ),
  )
