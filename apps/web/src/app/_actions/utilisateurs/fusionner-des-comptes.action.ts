'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { fusionnerDesComptes } from '@app/web/features/utilisateurs/abilities/fusionner-des-comptes'
import { FUSIONNER_DES_COMPTES_ERRORS } from '@app/web/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.errors'
import { FusionnerDesComptesValidation } from '@app/web/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.validation'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'

export const fusionnerDesComptesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(FusionnerDesComptesValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await fusionnerDesComptes(input)
        return resultat.success ? success(undefined) : resultat
      },
      { onError: FUSIONNER_DES_COMPTES_ERRORS },
    ),
  )
