'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import { rechercherDesComptesAFusionner } from '@/features/utilisateurs/abilities/fusionner-des-comptes'
import { RechercherDesComptesAFusionnerValidation } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.validation'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesComptesAFusionnerAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesComptesAFusionnerValidation))
  .execute(({ input }) => rechercherDesComptesAFusionner(input))
