'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { FUSIONNER_DES_COMPTES_ERRORS } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.errors'
import { FusionnerDesComptesValidation } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.validation'
import { fusionnerDesComptes } from '@/features/utilisateurs/abilities/fusionner-des-comptes/domain/fusionner-des-comptes'
import { retirerLaSourceDesListes } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/brevo/retirer-la-source-des-listes.mutation'
import { comptesAFusionner } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/prisma/comptes-a-fusionner.query'
import { fusionner } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/prisma/fusionner.mutation'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const fusionnerDesComptesAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  fusionnerDesComptes({
    lireLesComptesAFusionner: comptesAFusionner,
    fusionner: fusionner(synchroniserLaPersonne),
    retirerLaSourceDesListes,
  })

export const fusionnerDesComptesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(FusionnerDesComptesValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat =
          await fusionnerDesComptesAvec(synchroniserPersonne)(input)
        return resultat.success ? success(undefined) : resultat
      },
      { onError: FUSIONNER_DES_COMPTES_ERRORS },
    ),
  )
