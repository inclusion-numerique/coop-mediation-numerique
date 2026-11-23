'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { FUSIONNER_DES_COMPTES_ERRORS } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.errors'
import { FusionnerDesComptesValidation } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.validation'
import { fusionnerDesComptes } from '@/features/utilisateurs/abilities/fusionner-des-comptes/commands/fusionner-des-comptes'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const fusionnerDesComptesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(FusionnerDesComptesValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await fusionnerDesComptes(input, synchroniserPersonne)
        return resultat.success ? success(undefined) : resultat
      },
      { onError: FUSIONNER_DES_COMPTES_ERRORS },
    ),
  )
