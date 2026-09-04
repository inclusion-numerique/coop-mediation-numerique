'use server'

import { withAuth } from '@app/web/features/authentification'
import { searchLieuActiviteCombined } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation/searchLieuActiviteCombined'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

/**
 * Les suggestions du champ d'ajout : la coop, la cartographie nationale et,
 * en dernier recours, l'annuaire des entreprises.
 *
 * Elle sert les deux parcours qui ajoutent un lieu : le panier des lieux
 * d'activité et l'étape d'inscription. C'est une action et non une procédure
 * tRPC pour qu'elle ne franchisse pas la frontière du navigateur — elle tire le
 * client Prisma.
 */
export const rechercherDesLieuxAAjouterAction = actionBuilder()
  .use(withAuth())
  .use(withInput(z.object({ recherche: z.string() })))
  .execute(async ({ input }) => searchLieuActiviteCombined(input.recherche))
