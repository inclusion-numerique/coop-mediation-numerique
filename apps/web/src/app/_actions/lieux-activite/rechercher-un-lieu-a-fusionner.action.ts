'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { lieuxAFusionner } from '@app/web/features/lieux-activite/abilities/fusionner-des-lieux'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

/**
 * Les suggestions de l'écran de fusion. Réservées à l'administration, comme la
 * fusion elle-même : cette recherche voit tous les lieux de la coop, sans égard
 * pour ceux où l'on exerce.
 */
export const rechercherUnLieuAFusionnerAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(z.object({ recherche: z.string() })))
  .execute(async ({ input }) => lieuxAFusionner(input.recherche))
