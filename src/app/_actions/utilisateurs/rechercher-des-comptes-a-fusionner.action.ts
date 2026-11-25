'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesComptesAFusionnerValidation } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.validation'
import { rechercherDesComptesAFusionner } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/prisma/rechercher-des-comptes-a-fusionner.query'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesComptesAFusionnerAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesComptesAFusionnerValidation))
  .execute(({ input }) => rechercherDesComptesAFusionner(input))
