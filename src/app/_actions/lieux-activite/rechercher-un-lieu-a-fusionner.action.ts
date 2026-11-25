'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherUnLieuAFusionnerValidation } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/rechercher-un-lieu-a-fusionner.validation'
import { lieuxAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux/implementations/prisma/lieux-a-fusionner.query'
import { withInput } from '@/libraries/nextjs'

/**
 * Les suggestions de l'écran de fusion. Réservées à l'administration, comme la
 * fusion elle-même : cette recherche voit tous les lieux de la coop, sans égard
 * pour ceux où l'on exerce.
 */
export const rechercherUnLieuAFusionnerAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherUnLieuAFusionnerValidation))
  .execute(async ({ input }) => lieuxAFusionner(input.recherche))
