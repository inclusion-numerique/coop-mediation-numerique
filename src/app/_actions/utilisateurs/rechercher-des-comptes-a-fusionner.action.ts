'use server'

import { actionBuilder } from '@app/web/configuration/nextjs'
import { withAdmin, withAuth } from '@app/web/features/authentification'
import { rechercherDesComptesAFusionner } from '@app/web/features/utilisateurs/abilities/fusionner-des-comptes'
import { RechercherDesComptesAFusionnerValidation } from '@app/web/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.validation'
import { withInput } from '@app/web/libraries/nextjs'

export const rechercherDesComptesAFusionnerAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesComptesAFusionnerValidation))
  .execute(({ input }) => rechercherDesComptesAFusionner(input))
