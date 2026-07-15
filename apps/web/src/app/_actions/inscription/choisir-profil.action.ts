'use server'

import { withAuth } from '@app/web/features/authentification'
import {
  CHOISIR_PROFIL_ERRORS,
  ChoisirProfilValidation,
  choisirProfil,
} from '@app/web/features/inscription/abilities/choisir-profil'
import {
  enregistrerProfilChoisi,
  getInscriptionEtat,
} from '@app/web/features/inscription/abilities/choisir-profil/implementation'
import { UserId } from '@app/web/features/inscription/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

export const choisirProfilAction = actionBuilder()
  .use(withAuth())
  .use(withInput(ChoisirProfilValidation))
  .execute(
    fromResult(
      async ({ input, user }) =>
        choisirProfil({
          getInscriptionEtat,
          enregistrerProfilChoisi,
          maintenant: new Date(),
        })({
          userId: UserId(user.id),
          profil: input.profil,
        }),
      { onError: CHOISIR_PROFIL_ERRORS },
    ),
  )
