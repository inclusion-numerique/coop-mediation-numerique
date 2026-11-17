'use server'

import { z } from 'zod'
import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import { lieuxAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux'
import { withInput } from '@/libraries/nextjs'

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
