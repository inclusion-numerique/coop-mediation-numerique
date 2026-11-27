'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherUnLieuAFusionnerValidation } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/action/rechercher-un-lieu-a-fusionner.validation'
import { lieuxAFusionner } from '@/features/lieux-activite/abilities/rechercher-un-lieu-a-fusionner/implementations/prisma/lieux-a-fusionner.query'
import { withInput } from '@/libraries/nextjs'

export const rechercherUnLieuAFusionnerAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherUnLieuAFusionnerValidation))
  .execute(async ({ input }) => lieuxAFusionner(input.recherche))
